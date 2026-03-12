# Header Detection Rules

Defines the rules for first-row-as-headers behavior in the tabular data layer.

> **Note**: Header detection is primarily a Phase 3 (tabular data interchange) concern. This document describes the conventions that will apply to `sheetFromRows()` and `rowsFromSheet()`.

## Default Behavior

- The first row of a worksheet is treated as column headers by default
- Header values are used as property keys when converting rows to objects
- No automatic detection of "is this row a header?" — the first row is always assumed to be headers

## Header Source by Operation

| Operation | Header source |
|---|---|
| `sheetFromRows(objects)` | Keys of the first object |
| `rowsFromSheet(sheet)` | First row cell values |
| `SheetBuilder.addObjects(objects)` | Keys of the first object (Phase 4) |
| `SheetBuilder.setHeaders(headers)` | Explicitly provided array (Phase 4) |

## Duplicate Header Names

- Duplicate header names are not automatically deduplicated
- When converting to objects, later columns with duplicate names overwrite earlier ones
- Callers are responsible for ensuring unique header names if property uniqueness matters

## Empty Header Cells

- Empty cells in the header row produce `null` or empty string keys
- When converting to objects, these become properties with `null`/empty-string keys
- Callers should handle or pre-filter empty headers as needed

## Header Normalization

- No normalization is applied to header values
- Headers are preserved exactly as they appear in the cell values
- No trimming, case conversion, or special character removal
- Callers who need normalized keys should apply their own transformation

## Type Treatment

- Header cells are always `STRING` type when written via `sheetFromRows()`
- When reading, header cell types are not enforced — non-string headers (numbers, booleans) are converted to strings for use as property keys
