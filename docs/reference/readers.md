# Readers

## `WorkbookReader`

Read-only wrapper around a normalized workbook.

### `WorkbookReader.fromBuffer(buffer)`

Parses `.xlsx` bytes and returns a reader instance.

### `WorkbookReader.fromWorkbook(workbook)`

Wraps an existing normalized workbook object.

### `reader.sheet(nameOrIndex)`

Returns a `SheetReader` by name or zero-based index.

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

### `sheet.toObjects(options)`

Treats the first row as headers and returns plain row objects.
