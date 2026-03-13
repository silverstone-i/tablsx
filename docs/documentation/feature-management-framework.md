# Feature Management Framework

This project uses a product-scope-first process for handling feature requests.

## Why

`tablsx` can easily drift from a predictable XLSX data-interchange library into
a partial spreadsheet editing engine. That drift should be controlled through
explicit scope decisions, not ad hoc implementation.

## Triage Buckets

Every feature request should be classified into one of these buckets:

1. `In scope now`
   The feature fits the current product direction and may be planned or implemented.
2. `Deferred candidate`
   The feature is not in the current scope, but may be reconsidered later.
3. `Out of scope by design`
   The feature conflicts with the current package identity or roadmap.
4. `Needs strategy decision`
   The feature is too broad or architecture-shaping to classify without an explicit product call.

## Artifact Ownership

- `README.md` and `docs/`
  Describe current supported behavior only.
- `prd/PRD.md`
  Owns scope boundaries, deferred candidates, and the feature triage policy.
- `prd/adr/`
  Explains architecture-level decisions and rationale.
- `prd/rules/`
  Defines exact runtime behavior for accepted features.

## Workflow

1. Capture the request with a problem statement, examples, and explanation of why the current API is insufficient.
2. Classify the request into one of the four triage buckets.
3. If the feature is deferred or needs strategy discussion, update `prd/PRD.md` before any implementation work.
4. If the feature changes architecture or long-term direction, add or update an ADR.
5. If the feature is accepted, add or update rules describing the runtime contract.
6. Update public docs only after the feature exists or when a support statement changes.

## Current Interpretation for Spreadsheet Features

- Features like styling, comments, images, validation, panes, and conditional formatting are currently out of scope by design.
- Features like CSV support, streaming APIs, worksheet tables, and narrowly scoped convenience helpers are deferred candidates.
- No deferred candidate should be described in public docs as if it were planned or committed.
