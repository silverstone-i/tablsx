# Documentation Maintenance

Documentation changes should ship with the code changes they describe.

## Update rules

- Update `README.md` when package positioning, installation, or first-use guidance changes.
- Update `docs/guide/` when a user-facing workflow changes.
- Update `docs/reference/` when the public export surface or public behavior changes.
- Update `prd/rules/` when runtime behavior contracts change.
- Update `prd/adr/` when long-lived architecture or design decisions change.

## Example verification

- Prefer examples that can be imported into tests.
- Keep code snippets aligned with the public ESM entry point.
- When examples become stale, fix the examples first and then update the guide text around them.

## Review checklist

- Every new public export has JSDoc.
- Every public behavior change is reflected in the guides or reference docs.
- The VitePress site builds without broken links.
- README and docs use the same terminology for the workbook model.
