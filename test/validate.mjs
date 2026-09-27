import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

import { validateEvidenceCard } from "../lib/evidence-preflight-v1.mjs";

const root = resolve(import.meta.dirname, "..");
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

console.log("evidence-preflight-validator=PASS cases=8");
