# ADR-0008: Builder API

## Status
Accepted

## Context
Phases 1–3 provide a plain-object data model (`createWorkbook`, `createWorksheet`, `createCell`) and a tabular interchange layer (`sheetFromRows`). While powerful, constructing workbooks programmatically requires verbose boilerplate — manually creating cells, normalizing row lengths, and assembling the workbook structure. Phase 4 introduces a convenience layer for common authoring workflows.

## Decision
We adopt a **builder pattern** with two classes — `WorkbookBuilder` and `SheetBuilder` — that wrap the existing plain-object model. Key design choices:

1. **Thin wrapper, not alternative data path.** `build()` produces the same `Workbook`/`Worksheet`/`Cell` plain objects used everywhere else. The builder delegates to `createCell`, `normalizeRows`, and `createWorkbook`.

2. **Fluent API.** Mutation methods (`addRow`, `addRows`, `addObjects`, `setHeaders`) return `this` for chaining.

3. **`sheet()` is get-or-create.** Calling `wb.sheet("Name")` twice returns the same `SheetBuilder`, enabling incremental construction without tracking references.

4. **Type inference reuse.** The builder relies on `createCell` → `inferType` for all value-to-cell conversion, ensuring identical type rules across the entire API surface.

5. **`addObjects` mirrors `sheetFromRows` semantics.** Key union for headers, JSON.stringify for nested objects, empty cells for missing keys.

## Alternatives Considered

**Fluent interface on plain objects (no classes):** Would require passing context through every function call, making the API less ergonomic.

**Extending the data model with methods:** Would break the JSON-serializable plain-object constraint (ADR-0001).

**Merging builder into `sheetFromRows`:** `sheetFromRows` handles the object-to-sheet case well but doesn't cover raw row construction or incremental building.

## Consequences

- Developers get a concise API for the most common workbook-construction patterns.
- The builder adds no new data types or behaviors — it is purely ergonomic.
- The internal data model remains unchanged and JSON-serializable.
- Both the low-level (`createCell`/`createWorksheet`) and high-level (`WorkbookBuilder`) APIs coexist; users choose based on their needs.
