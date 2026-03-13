# Data Types and Limits

## Supported cell types

`tablsx` normalizes cells into these logical types:

- `string`
- `number`
- `boolean`
- `date`
- `empty`
- `formula`
- `vector`

Use `CellType` when you need explicit overrides or want to validate a type name.

## Dates

Dates are represented as JavaScript `Date` instances in the normalized model. Excel serial conversion is handled by:

- `excelDateToJS`
- `jsDateToExcel`

The implementation compensates for Excel's 1900 leap-year bug. The detailed behavior contract lives in the internal PRD rules set under `prd/rules/date-handling.md`.

## Vectors

Numeric arrays are supported as a `vector` type. They are serialized using JSON string representation. The internal serialization rule is documented in `prd/rules/vector-serialization.md`.

## Formulas

Formula cells store both a `formula` string and a normalized `type`. The package focuses on representation and round-trip behavior, not formula evaluation. The internal rationale lives in `prd/adr/0006-formula-handling.md`.

## Current Scope Boundaries

`tablsx` is intentionally not a full spreadsheet editing engine. The following
feature classes are currently out of scope:

- rich styling and formatting APIs
- comments, images, and advanced worksheet layout controls
- Excel UI features such as panes, validation rules, or conditional formatting

Some feature ideas remain under consideration for future scope review, but they
are not currently supported. The internal feature classification lives in
`prd/PRD.md` and `prd/rules/limitations.md`.
