# Evidence Preflight

Evidence Preflight is a small, inspectable contract for documenting a research or technical claim before asking someone to trust it.

This repository contains the published v1 JSON Schema, a neutral valid example, and a dependency-free Node.js validator. The interactive browser worksheet is available at [kaldenframelabs.com/preflight](https://kaldenframelabs.com/preflight/).

## What the contract records

Every complete card carries seven bounded records:

1. claim;
2. scope;
3. provenance;
4. comparison;
5. failure criteria;
6. known limitations; and
7. decision use.

Conformance means those documentation fields are present and structurally valid. It does **not** establish that the evidence is correct, causal, reproducible, sufficient, or fit for a decision.

## Validate a card locally

Node.js 20 or newer is recommended. No package installation is required.

```shell
node bin/validate-evidence-card.mjs examples/evidence-preflight-v1.example.json
```

A valid card exits with status `0`. An invalid, malformed, or oversized card exits with status `1` and reports structural errors without printing the card contents. Input is limited to 64 KB, matching the browser worksheet's local-import boundary.

Run the included checks with:

```shell
npm test
```

## Machine-readable assets

- [`schema/evidence-preflight-v1.schema.json`](schema/evidence-preflight-v1.schema.json) — Draft 2020-12 schema.
- [`examples/evidence-preflight-v1.example.json`](examples/evidence-preflight-v1.example.json) — neutral complete example.
- [`lib/evidence-preflight-v1.mjs`](lib/evidence-preflight-v1.mjs) — dependency-free structural validator.
- [`bin/validate-evidence-card.mjs`](bin/validate-evidence-card.mjs) — local command-line entry point.

Canonical hosted copies:

- <https://kaldenframelabs.com/schemas/evidence-preflight-v1.schema.json>
- <https://kaldenframelabs.com/examples/evidence-preflight-v1.example.json>

## Privacy and scope

The hosted worksheet processes entries in the browser and does not upload or persist them. The command-line validator reads only the local file path supplied to it and performs no network requests.

The validator intentionally accepts only exact, complete v1 exports. Additional properties, changed contract constants, malformed or impossible RFC 3339 timestamps, short fields, and files over 64 KB are rejected before use. Timestamp checks cover calendar month lengths, leap years, time ranges, and numeric UTC offsets without relying on permissive runtime date parsing.

## Security

See [SECURITY.md](SECURITY.md) for the vulnerability-reporting contact and testing boundary.

© 2026 KaldenFrame Labs. Publication of this repository does not weaken the documentation-not-truth boundary stated in the schema and every evidence card.
