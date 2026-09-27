export const SCHEMA_URL = "https://kaldenframelabs.com/schemas/evidence-preflight-v1.schema.json";
export const SCHEMA_ID = "kaldenframe.evidence-preflight.v1";
export const GENERATOR = "KaldenFrame Labs Evidence Preflight";
export const BOUNDARY = "Documentation completeness is not evidence of correctness, validity, or fitness for use.";
export const MAX_FILE_BYTES = 64 * 1024;

export const FIELD_LIMITS = Object.freeze({
  claim: [24, 700],
  scope: [32, 900],
  provenance: [32, 1100],
  comparison: [24, 800],
  failure: [24, 900],
  limitations: [24, 1000],
  decision: [20, 700],
});

const TOP_LEVEL_KEYS = Object.freeze([
  "schema_url",
  "schema",
  "generated_at",
  "generator",
  "documentation_status",
  "record",
  "boundary",
]);

function isObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function hasExactKeys(value, expected) {
  if (!isObject(value)) return false;
  const actual = Object.keys(value).sort();
  const wanted = [...expected].sort();
  return actual.length === wanted.length && actual.every((key, index) => key === wanted[index]);
}

function isDateTime(value) {
  if (typeof value !== "string") return false;
  const rfc3339 = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;
  return rfc3339.test(value) && !Number.isNaN(Date.parse(value));
}

export function validateEvidenceCard(card) {
  const errors = [];

  if (!hasExactKeys(card, TOP_LEVEL_KEYS)) {
    return { valid: false, errors: ["Card must contain exactly the seven Evidence Preflight v1 top-level properties."] };
  }

  if (card.schema_url !== SCHEMA_URL) errors.push("schema_url does not identify the canonical v1 schema.");
  if (card.schema !== SCHEMA_ID) errors.push("schema does not identify the Evidence Preflight v1 contract.");
  if (card.generator !== GENERATOR) errors.push("generator is not the Evidence Preflight generator constant.");
  if (card.documentation_status !== "COMPLETE") errors.push("documentation_status must be COMPLETE.");
  if (card.boundary !== BOUNDARY) errors.push("boundary is missing or changed.");
  if (!isDateTime(card.generated_at)) errors.push("generated_at must be an RFC 3339 date-time.");

  const fieldNames = Object.keys(FIELD_LIMITS);
  if (!hasExactKeys(card.record, fieldNames)) {
    errors.push("record must contain exactly the seven Evidence Preflight v1 fields.");
  } else {
    for (const [name, [minimum, maximum]] of Object.entries(FIELD_LIMITS)) {
      const value = card.record[name];
      if (typeof value !== "string") {
        errors.push(`record.${name} must be text.`);
        continue;
      }
      const length = value.replace(/\r\n/g, "\n").trim().length;
      if (length < minimum) errors.push(`record.${name} is shorter than ${minimum} characters.`);
      if (length > maximum) errors.push(`record.${name} exceeds ${maximum} characters.`);
    }
  }

  return { valid: errors.length === 0, errors };
}
