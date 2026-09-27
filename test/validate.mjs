import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import { validateEvidenceCard } from "../lib/evidence-preflight-v1.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
const valid = JSON.parse(readFileSync(join(root, "examples", "evidence-preflight-v1.example.json"), "utf8"));
const clone = (value) => JSON.parse(JSON.stringify(value));

assert.equal(validateEvidenceCard(valid).valid, true);

const wrongBoundary = clone(valid);
wrongBoundary.boundary = "Changed";
assert.match(validateEvidenceCard(wrongBoundary).errors.join(" "), /boundary/);

const shortClaim = clone(valid);
shortClaim.record.claim = "too short";
assert.match(validateEvidenceCard(shortClaim).errors.join(" "), /record\.claim/);

const extraProperty = clone(valid);
extraProperty.record.extra = "not allowed";
assert.match(validateEvidenceCard(extraProperty).errors.join(" "), /exactly the seven/);

const invalidDate = clone(valid);
invalidDate.generated_at = "2026";
assert.match(validateEvidenceCard(invalidDate).errors.join(" "), /RFC 3339/);

const impossibleDate = clone(valid);
impossibleDate.generated_at = "2026-02-30T12:00:00Z";
assert.match(validateEvidenceCard(impossibleDate).errors.join(" "), /RFC 3339/);

const nonRfcDate = clone(valid);
nonRfcDate.generated_at = "September 27, 2026 12:00:00 UTC";
assert.match(validateEvidenceCard(nonRfcDate).errors.join(" "), /RFC 3339/);

const invalidLeapDay = clone(valid);
invalidLeapDay.generated_at = "2025-02-29T12:00:00Z";
assert.match(validateEvidenceCard(invalidLeapDay).errors.join(" "), /RFC 3339/);

const validLeapDay = clone(valid);
validLeapDay.generated_at = "2024-02-29T23:59:59.123+14:00";
assert.equal(validateEvidenceCard(validLeapDay).valid, true);

const validCli = spawnSync(process.execPath, [join(root, "bin", "validate-evidence-card.mjs"), join(root, "examples", "evidence-preflight-v1.example.json")], { encoding: "utf8" });
assert.equal(validCli.status, 0, validCli.stderr);
assert.match(validCli.stdout, /^VALID/);

const temp = mkdtempSync(join(tmpdir(), "evidence-preflight-test-"));
try {
  const malformed = join(temp, "malformed.json");
  writeFileSync(malformed, "not json", "utf8");
  const malformedCli = spawnSync(process.execPath, [join(root, "bin", "validate-evidence-card.mjs"), malformed], { encoding: "utf8" });
  assert.equal(malformedCli.status, 1);
  assert.match(malformedCli.stderr, /not valid JSON/);

  const oversized = join(temp, "oversized.json");
  writeFileSync(oversized, "x".repeat(65537), "utf8");
  const oversizedCli = spawnSync(process.execPath, [join(root, "bin", "validate-evidence-card.mjs"), oversized], { encoding: "utf8" });
  assert.equal(oversizedCli.status, 1);
  assert.match(oversizedCli.stderr, /65536 byte limit/);
} finally {
  rmSync(temp, { recursive: true, force: true });
}

console.log("evidence-preflight-validator=PASS cases=12");
