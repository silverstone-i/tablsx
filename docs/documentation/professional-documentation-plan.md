# Professional Documentation Plan

This plan defines how to implement professional package documentation for `tablsx` using JSDoc, VitePress, and handwritten guides.

## Goals

- Produce a polished public documentation experience for npm and GitHub users.
- Keep API reference close to the source so docs stay accurate.
- Separate onboarding guides from low-level reference material.
- Make documentation maintainable as the package evolves.

## Implementation Plan

1. Audit the public API and group exports into documentation sections: core read/write, workbook model helpers, tabular helpers, builders, readers, and utilities.
2. Add comprehensive JSDoc to all public exports and public classes/methods, standardizing descriptions, params, returns, thrown errors, examples, and cross-links where useful.
3. Introduce a docs toolchain in `package.json` with VitePress scripts, JSDoc generation support if needed, and a lightweight docs build workflow compatible with the existing Node 18+ ESM setup.
4. Create a VitePress site under `docs/` with professional information architecture: home page, getting started, reading workbooks, writing workbooks, tabular workflows, builder API, data types and behavior, limitations and non-goals, and API reference landing pages.
5. Rewrite `README.md` as a concise package landing page focused on npm and GitHub readers, with installation, a 60-second example, feature summary, and links into the full docs site.
6. Add runnable or test-backed examples that mirror the documentation's main workflows so code snippets stay accurate over time.
7. Document contribution expectations for docs maintenance: when to update guides, how examples are validated, and how API changes map to README and docs updates.
8. Build and verify the docs locally, checking for broken links, missing exports, awkward API descriptions, and gaps between source behavior and documentation claims.

## Deliverables

- Source-level JSDoc on the public ESM API
- VitePress docs site under `docs/`
- Handwritten guides for major user workflows
- Refined `README.md`
- Verified examples tied to tests or runnable samples
- Documentation maintenance guidance for contributors

## Proposed Documentation Structure

- `README.md`
- `docs/.vitepress/`
- `docs/index.md`
- `docs/guide/getting-started.md`
- `docs/guide/reading-workbooks.md`
- `docs/guide/writing-workbooks.md`
- `docs/guide/tabular-workflows.md`
- `docs/guide/builder-api.md`
- `docs/reference/index.md`
- `docs/reference/core-api.md`
- `docs/reference/tabular-api.md`
- `docs/reference/builders.md`
- `docs/reference/utilities.md`
- `docs/reference/readers.md`
- `docs/reference/data-types.md`
- `docs/documentation/`

## Notes

- The public documentation should be organized around consumer workflows, not internal implementation layers.
- API reference should be derived from or tightly aligned with JSDoc on exported symbols.
- Guides should be written by hand, because generated reference docs alone will not present the package professionally.
