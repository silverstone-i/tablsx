# Choosing an API

`tablsx` exposes both plain functions and small helper classes. They operate on
the same normalized workbook model, but they fit different workflows.

## Start with functions by default

Use the function-based APIs when your code already has a clear data flow and you
do not need a wrapper object:

- `readXlsx(buffer)` parses `.xlsx` bytes into a normalized workbook object
- `writeXlsx(workbook)` serializes a normalized workbook object back to bytes
- `createWorkbook()`, `createWorksheet()`, and `createCell()` construct the
  normalized model directly
- `sheetFromRows()` and `rowsFromSheet()` convert between row objects and
  worksheets

Use functions when you want:

- the smallest possible API surface
- plain objects that are easy to inspect, test, and pass around
- direct control over workbook construction
- simple one-step parse or write operations

## Use builder classes for incremental construction

Use `WorkbookBuilder` and `SheetBuilder` when you want to assemble a workbook in
steps instead of creating the full object graph in one expression.

Choose builders when you need:

- a fluent API for adding sheets and rows over time
- explicit `setHeaders()` and `addObjects()` workflows
- workbook construction spread across multiple code paths before calling
  `build()`

Builders still produce the same normalized workbook object, so they are a
construction convenience rather than a separate model.

See [Builder API](/guide/builder-api) for examples.

## Use reader classes for navigable read access

Use `WorkbookReader` and `SheetReader` when you already have a workbook and want
convenient read-only accessors over it.

Choose readers when you need:

- sheet lookup by name or index
- convenience properties such as `sheetNames`, `sheetCount`, `rowCount`, and
  `columnCount`
- helper conversions like `toValues()` and `toObjects()`
- a small read-focused abstraction instead of repeated manual indexing into
  `workbook.sheets`

Readers wrap the normalized workbook model. They do not create a second parsing
format and they do not replace `readXlsx`; they sit on top of it.

See [Reader API](/guide/reader-api) for examples.

## Quick decision guide

### Parsing `.xlsx` bytes

Use `readXlsx()` when you just need the normalized workbook object.

Use `WorkbookReader.fromBuffer()` when you want to parse and immediately work
through convenience accessors.

### Writing `.xlsx` bytes

Use `writeXlsx()` in all cases. There is no writer class abstraction today.

### Constructing a workbook

Use `createWorkbook()` and `createWorksheet()` when the workbook shape is
already known and you want explicit plain objects.

Use `WorkbookBuilder` when the workbook is assembled gradually or benefits from
fluent row-oriented construction.

### Converting tabular data

Use `sheetFromRows()` and `rowsFromSheet()` when your source or output is
already row-object shaped.

Use `SheetBuilder.addObjects()` or `SheetReader.toObjects()` when you want those
same conversions from within a class-based workflow.

## Same model, different ergonomics

The main design rule is simple: functions, builders, and readers all meet at
the same normalized workbook shape.

- functions are the lowest-friction default
- builders help you construct workbooks incrementally
- readers help you inspect parsed workbooks conveniently
