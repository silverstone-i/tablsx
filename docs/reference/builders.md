# Builders

Use builders when workbook construction is incremental or easier to express as a
fluent sequence of operations. If the workbook shape is already known up front,
the plain model helpers `createWorkbook()` and `createWorksheet()` are usually
the simpler choice.

## `WorkbookBuilder`

Fluent builder for multi-sheet workbook creation.

### `WorkbookBuilder.create()`

Creates a new root builder.

### `builder.sheet(name)`

Returns a `SheetBuilder` for the given name. Reuses the existing builder when called with the same name.

### `builder.build()`

Builds a normalized `Workbook`.

Use this when you are done assembling the workbook and want to pass the result
to `writeXlsx()` or other function-based helpers.

## `SheetBuilder`

Fluent builder for worksheet construction.

### `new SheetBuilder(name)`

Creates a sheet builder with the target worksheet name.

### `sheet.setHeaders(headers)`

Sets an explicit header row. Must be called before adding rows.

### `sheet.addRow(values)`

Appends one row of raw JavaScript values.

Prefer this when your source data is positional rather than object-based.

### `sheet.addRows(rows)`

Appends multiple rows of positional data.

### `sheet.addObjects(objects, options)`

Appends row objects using the same conversion rules as `sheetFromRows`.

Use this when you want builder-style construction but your input data already
exists as JavaScript row objects.

### `sheet.build()`

Builds a normalized `Worksheet`.

This returns the same worksheet shape you would get from direct model helpers.
