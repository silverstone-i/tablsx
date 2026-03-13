# Readers

Use readers when you want convenience accessors over a normalized workbook. If
you only need the plain parsed object, `readXlsx()` remains the lower-friction
entry point.

## `WorkbookReader`

Read-only wrapper around a normalized workbook.

### `WorkbookReader.fromBuffer(buffer)`

Parses `.xlsx` bytes and returns a reader instance.

Use this instead of `readXlsx()` when you want to start from bytes and then work
through sheet-level helper methods.

### `WorkbookReader.fromWorkbook(workbook)`

Wraps an existing normalized workbook object.

Use this when your code already parsed or constructed the workbook elsewhere but
you still want reader conveniences.

### `reader.sheet(nameOrIndex)`

Returns a `SheetReader` by name or zero-based index.

Prefer this over manual `workbook.sheets[index]` access when lookup by sheet
name matters or when you want clearer bounds errors.

### `reader.sheetNames`

Array of worksheet names in workbook order.

### `reader.sheetCount`

Number of worksheets.

## `SheetReader`

Read-only helper for one worksheet.

### `sheet.name`

Worksheet name.

### `sheet.rows`

Normalized cell grid.

This exposes the underlying worksheet rows directly when you still want raw cell
access.

### `sheet.rowCount`

Number of rows.

### `sheet.columnCount`

Number of columns after row normalization.

### `sheet.getRow(index)`

Returns one normalized row by zero-based index.

### `sheet.getCell(row, col)`

Returns one normalized cell by zero-based coordinates.

### `sheet.toValues()`

Returns a 2D array of raw cell values.

Use this when cell metadata is no longer needed.

### `sheet.toObjects(options)`

Treats the first row as headers and returns plain row objects.

This is the reader-oriented counterpart to `rowsFromSheet()`.
