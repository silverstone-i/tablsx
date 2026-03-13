# Tabular API

## `sheetFromRows(rows, options)`

Converts an array of plain objects into a worksheet.

- Uses the union of object keys for the header row
- Preserves missing properties as empty cells
- JSON-encodes nested non-array objects
- Supports per-column type overrides

## `rowsFromSheet(sheet, options)`

Converts a worksheet back into row objects.

- Treats the first row as headers
- Disambiguates duplicate headers with suffixes like `_2`
- Supports per-column type overrides for vectors and dates

## `inferSchema(sheet)`

Scans a worksheet and returns:

- column name
- dominant type
- nullable flag

Use it for import previews, validation scaffolding, or diagnostics.
