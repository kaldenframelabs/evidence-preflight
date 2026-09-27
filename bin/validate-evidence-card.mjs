#!/usr/bin/env node

import { readFile, stat } from "node:fs/promises";
import { resolve } from "node:path";
import { MAX_FILE_BYTES, validateEvidenceCard } from "../lib/evidence-preflight-v1.mjs";

const input = process.argv[2];

if (!input) {
  console.error("Usage: node bin/validate-evidence-card.mjs <evidence-card.json>");
  process.exit(2);
}

const path = resolve(input);

try {
  const info = await stat(path);
  if (!info.isFile()) throw new Error("Input path is not a file.");
  if (info.size > MAX_FILE_BYTES) {
    console.error(`INVALID: file exceeds the ${MAX_FILE_BYTES} byte limit.`);
    process.exit(1);
  }

  let card;
  try {
    card = JSON.parse(await readFile(path, "utf8"));
  } catch {
    console.error("INVALID: file is not valid JSON.");
    process.exit(1);
  }

  const result = validateEvidenceCard(card);
  if (!result.valid) {
    console.error("INVALID Evidence Preflight v1 card:");
    for (const error of result.errors) console.error(`- ${error}`);
    process.exit(1);
  }

  console.log("VALID Evidence Preflight v1 card");
} catch (error) {
  console.error(`ERROR: ${error instanceof Error ? error.message : "Could not read input file."}`);
  process.exit(2);
}
