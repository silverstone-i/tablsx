# Collaboration Best Practices

This guide defines how to collaborate effectively on `tablsx` while preserving correctness, maintainability, and predictable behavior.

## 1) Follow the architecture boundaries

- Keep the layer boundaries clear:
  - `reader/`: XLSX ZIP/XML -> internal model
  - `writer/`: internal model -> XLSX ZIP/XML
  - `model/`: workbook/worksheet/cell primitives and invariants
  - `tabular/`: row-object and schema APIs
  - `builder/`: convenience authoring APIs
  - `utils/`: reusable, side-effect-free helpers
- Avoid adding application-specific logic to this library.
- Do not introduce dependencies on other XLSX engines.

## 2) Keep behavior deterministic

- Preserve round-trip behavior for supported types: `read -> write -> read`.
- Keep explicit handling for edge cases:
  - empty cells
  - boolean encoding (`0/1`)
  - formula + cached value behavior
  - date serial conversion (including 1900 bug handling)
  - vector serialization/deserialization
- Prefer explicit rules over implicit heuristics where data correctness is at risk.

## 3) Use ADRs and rules docs for behavior changes

- If a change alters architecture or long-lived design decisions, add or update an ADR in `prd/adr/`.
- If a change alters runtime behavior contracts, update the relevant rule doc in `prd/rules/`.
- Keep docs and code changes in the same PR when possible.

## 4) Testing expectations

- Add targeted unit tests for every new behavior in the corresponding test area:
  - `test/reader/`, `test/writer/`, `test/tabular/`, `test/model/`, `test/utils/`, `test/builder/`
- Add or update round-trip tests for data-shape/type changes.
- Add fixture-based tests when behavior depends on realistic Excel file structure.
- Run before submitting:
  - `npm test`
  - `npm run lint`
  - `npm run format:check`

## 5) Code quality and review standards

- Prefer small, focused PRs over large mixed changes.
- Keep public API additions intentional and documented.
- Preserve backward compatibility where feasible; when breaking changes are necessary, document them clearly.
- During review, prioritize:
  - correctness and regression risk
  - type/value fidelity
  - performance impact on large sheets
  - test coverage gaps

## 6) Performance and scalability discipline

- Be careful with full-sheet copies and nested loops over large row/column ranges.
- Reuse existing utilities before adding new parsing or serialization logic.
- Document any algorithmic trade-offs in PR descriptions.

## 7) Commit and documentation hygiene

- Write clear commit messages that explain intent and user-facing impact.
- Keep README/API docs current with exported functionality.
- If feature support changes relative to `exceljs`, update:
  - `docs/feature-list-vs-exceljs.md`
  - `README.md` (when user-facing positioning changes)

## 8) Suggested pull request checklist

- [ ] Scope is focused and architecture boundaries are respected.
- [ ] Tests added/updated for new behavior and edge cases.
- [ ] Lint/format/tests pass locally.
- [ ] ADR/rules docs updated when needed.
- [ ] README/API docs updated when needed.
- [ ] Backward-compatibility impact assessed and documented.
