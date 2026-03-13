# Header Detection Rules

Defines the rules for first-row-as-headers behavior in the tabular data layer.

> **Note**: Header detection is primarily a tabular data interchange concern. This document describes the conventions that apply to `sheetFromRows()`, `rowsFromSheet()`, `SheetBuilder.addObjects()`, and `SheetReader.toObjects()`.

## Default Behavior

- The first row of a worksheet is treated as column headers by default
- Header values are used as property keys when converting rows to objects
- No automatic detection of "is this row a header?" — the first row is always assumed to be headers

## Header Source by Operation

| Operation | Header source |
|---|---|
| `sheetFromRows(objects)` | Union of keys from all objects |
| `rowsFromSheet(sheet)` | First row cell values |
| `SheetBuilder.addObjects(objects)` | Union of keys from all provided objects; delegates to `sheetFromRows()` (Phase 4) |
| `SheetBuilder.setHeaders(headers)` | Explicitly provided array (Phase 4) |
| `SheetReader.toObjects()` | First row cell values (with duplicate-name disambiguation); delegates to `rowsFromSheet()`. Accepts explicit `headers` option (Phase 4) |

## Duplicate Header Names

- Duplicate header names in `rowsFromSheet()` (and `SheetReader.toObjects()`, which delegates to it) are automatically disambiguated by appending `_2`, `_3`, etc. (e.g., `["id", "id", "id"]` becomes `["id", "id_2", "id_3"]`)
- This prevents silent data loss when converting to objects, where later columns would otherwise overwrite earlier ones
- The original header text is preserved for the first occurrence; only subsequent duplicates receive a suffix

## Empty Header Cells

- Empty or null cells in the header row produce empty string (`""`) keys — they do not become the literal string `"null"`
- When converting to objects, these become properties with empty-string keys
- Callers should handle or pre-filter empty headers as needed

## Header Normalization

- No normalization is applied to header values
- Headers are preserved exactly as they appear in the cell values
- No trimming, case conversion, or special character removal
- Callers who need normalized keys should apply their own transformation

## Type Treatment

- Header cells are always `STRING` type when written via `sheetFromRows()`
- When reading, header cell types are not enforced — non-string headers (numbers, booleans) are converted to strings for use as property keys
