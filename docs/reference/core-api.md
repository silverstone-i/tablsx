# Core API

## `readXlsx(buffer)`

Reads `.xlsx` bytes and returns a normalized `Workbook`.

- Input: `Buffer | Uint8Array`
- Output: `Workbook`
- Throws when required XLSX package parts are missing or inconsistent

## `writeXlsx(workbook)`

Writes a normalized `Workbook` to `.xlsx` bytes.

- Input: `Workbook`
- Output: `Uint8Array`
- Validates sheet names and normalizes row widths before writing

## `createWorkbook(sheets = [])`

Creates a workbook object and validates Excel sheet naming constraints.

## `createWorksheet(name, rows = [])`

Creates a worksheet object.

## `createCell(value = null, formula = null, type)`

Creates a normalized cell object.

- If `type` is omitted, `tablsx` infers it from `value`
- If `formula` is provided without a `type`, the cell type becomes `formula`

## `CellType`

Enum of supported logical cell types:

- `STRING`
- `NUMBER`
- `BOOLEAN`
- `DATE`
- `EMPTY`
- `FORMULA`
- `VECTOR`

## `inferType(value)`

Infers the logical cell type from a JavaScript value.

## `isCellType(type)`

Checks whether a string is one of the supported `CellType` values.
