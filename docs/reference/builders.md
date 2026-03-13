# Builders

## `WorkbookBuilder`

Fluent builder for multi-sheet workbook creation.

### `WorkbookBuilder.create()`

Creates a new root builder.

### `builder.sheet(name)`

Returns a `SheetBuilder` for the given name. Reuses the existing builder when called with the same name.

### `builder.build()`

Builds a normalized `Workbook`.

## `SheetBuilder`

Fluent builder for worksheet construction.

### `new SheetBuilder(name)`

Creates a sheet builder with the target worksheet name.

### `sheet.setHeaders(headers)`

Sets an explicit header row. Must be called before adding rows.

### `sheet.addRow(values)`

Appends one row of raw JavaScript values.

### `sheet.addRows(rows)`

Appends multiple rows of positional data.

### `sheet.addObjects(objects, options)`

Appends row objects using the same conversion rules as `sheetFromRows`.

### `sheet.build()`

Builds a normalized `Worksheet`.
