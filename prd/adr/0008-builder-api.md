# ADR-0008: Convenience API (Builder and Reader)

## Status
Accepted

## Context
Phases 1–3 provide a plain-object data model (`createWorkbook`, `createWorksheet`, `createCell`) and a tabular interchange layer (`sheetFromRows`, `rowsFromSheet`). While powerful, both constructing and navigating workbooks programmatically require verbose boilerplate — manually creating cells, normalizing row lengths, assembling the workbook structure, and indexing into nested arrays to access values. Phase 4 introduces convenience classes for both writing and reading workflows.

## Decision
We adopt **thin wrapper classes** for both authoring and reading that wrap the existing plain-object model:

### Builder classes (`WorkbookBuilder`, `SheetBuilder`)

1. **Thin wrapper, not alternative data path.** `build()` produces the same `Workbook`/`Worksheet`/`Cell` plain objects used everywhere else. The builder delegates to `createCell`, `normalizeRows`, and `createWorkbook`.

2. **Fluent API.** Mutation methods (`addRow`, `addRows`, `addObjects`, `setHeaders`) return `this` for chaining.

3. **`sheet()` is get-or-create.** Calling `wb.sheet("Name")` twice returns the same `SheetBuilder`, enabling incremental construction without tracking references.

4. **Type inference reuse.** The builder relies on `createCell` → `inferType` for all value-to-cell conversion, ensuring identical type rules across the entire API surface.

5. **`addObjects` delegates to `sheetFromRows`.** Key union for headers, JSON.stringify for nested objects, empty cells for missing keys, column type overrides via `options.columns`.

### Reader classes (`WorkbookReader`, `SheetReader`)

1. **Read-only wrapper over parsed data.** `WorkbookReader` wraps a `Workbook` object (from `readXlsx` or `WorkbookBuilder.build()`), providing sheet access by name or index. `SheetReader` wraps a single `Worksheet`.

2. **Multiple construction paths.** `WorkbookReader.fromBuffer(buffer)` parses an `.xlsx` file directly. `WorkbookReader.fromWorkbook(workbook)` wraps an existing plain-object workbook.

3. **Value extraction shortcuts.** `SheetReader.toValues()` strips Cell metadata to return a plain `any[][]`. `SheetReader.toObjects()` delegates to `rowsFromSheet()` for duplicate-header disambiguation, column type overrides (vector, date), and automatic vector deserialization.

4. **Bounds-checked access.** `getRow(index)` and `getCell(row, col)` throw `RangeError` for out-of-bounds indices. `sheet(name)` throws for unknown sheet names.

## Alternatives Considered

**Fluent interface on plain objects (no classes):** Would require passing context through every function call, making the API less ergonomic.

**Extending the data model with methods:** Would break the JSON-serializable plain-object constraint (ADR-0001).

**Merging builder into `sheetFromRows`:** `sheetFromRows` handles the object-to-sheet case well but doesn't cover raw row construction or incremental building.

**Using `rowsFromSheet` directly instead of `SheetReader.toObjects()`:** `toObjects()` now delegates to `rowsFromSheet()` internally, so both share the same capabilities — duplicate header disambiguation, column type overrides, and vector/date deserialization. The class method adds ergonomic sheet access; the standalone function works on plain objects.

## Consequences

- Developers get a concise API for the most common workbook construction and reading patterns.
- The convenience classes add no new data types or behaviors — they are purely ergonomic.
- The internal data model remains unchanged and JSON-serializable.
- Both the low-level (`createCell`/`createWorksheet`) and high-level (`WorkbookBuilder`/`WorkbookReader`) APIs coexist; users choose based on their needs.
- `SheetReader.toObjects()` delegates to `rowsFromSheet()` and `SheetBuilder.addObjects()` delegates to `sheetFromRows()` — the classes are convenience wrappers over the tabular layer, not alternative implementations.
