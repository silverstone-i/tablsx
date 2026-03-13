# Documentation Maintenance

Documentation changes should ship with the code changes they describe.

## Update rules

- Update `README.md` when package positioning, installation, or first-use guidance changes.
- Update `docs/guide/` when a user-facing workflow changes.
- Update `docs/reference/` when the public export surface or public behavior changes.
- Update `prd/PRD.md` when feature scope, deferred candidates, or triage policy changes.
- Update `prd/rules/` when runtime behavior contracts change.
- Update `prd/adr/` when long-lived architecture or design decisions change.

## Feature request handling

- Classify every new feature request as `in scope now`, `deferred candidate`, `out of scope by design`, or `needs strategy decision`.
- Track plausible future work in `prd/PRD.md`, not in public docs that read like commitments.
- Add rules only for accepted features with defined runtime behavior.
- Add ADRs when a feature changes architecture or product identity.

## Example verification

- Prefer examples that can be imported into tests.
- Keep code snippets aligned with the public ESM entry point.
- When examples become stale, fix the examples first and then update the guide text around them.

## Review checklist

- Every new public export has JSDoc.
- Every public behavior change is reflected in the guides or reference docs.
- The VitePress site builds without broken links.
- README and docs use the same terminology for the workbook model.
