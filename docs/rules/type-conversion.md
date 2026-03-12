# Type Conversion Rules

Defines the mapping between Excel Open XML cell types and the tablsx internal data model.

## Excel → JavaScript Type Mapping

| Excel `t` attribute | Excel `<v>` content | tablsx `CellType` | JavaScript `value` |
|---|---|---|---|
| `s` | Shared string index | `STRING` | `string` (resolved from shared strings table) |
| `inlineStr` | `<is><t>text</t></is>` | `STRING` | `string` (extracted from inline text) |
| `n` (or absent) | Numeric string | `NUMBER` | `number` |
| `n` (or absent) + date style | Numeric string | `DATE` | `Date` (converted from serial number) |
| `b` | `0` or `1` | `BOOLEAN` | `boolean` (`false` or `true`) |
| (absent) | (absent or empty) | `EMPTY` | `null` |
| Any | (with `<f>` element) | `FORMULA` | `string \| number \| null` (cached result) |
| `e` | Error string | `STRING` | `string` (e.g., `"#REF!"`) |

## JavaScript → Excel Type Mapping

| tablsx `CellType` | JavaScript `value` | Excel `t` attribute | Excel `<v>` content |
|---|---|---|---|
| `STRING` | `string` | `s` | Shared string index |
| `NUMBER` | `number` | (none) | Numeric string |
| `BOOLEAN` | `boolean` | `b` | `1` or `0` |
| `DATE` | `Date` | (none) + style `s="1"` | Serial number |
| `EMPTY` | `null` | (skipped) | (skipped) |
| `FORMULA` | `string \| number \| null` | (inferred from value) | Cached result in `<v>`, formula in `<f>` |
| `VECTOR` | `number[]` | `s` | Shared string index (JSON array string) |

## Type Inference Rules

When `createCell()` is called without an explicit type, `inferType(value)` determines the type:

1. `null` or `undefined` → `EMPTY`
2. `typeof value === "string"` → `STRING`
3. `typeof value === "number"` → `NUMBER`
4. `typeof value === "boolean"` → `BOOLEAN`
5. `value instanceof Date` → `DATE`
6. `Array.isArray(value) && value.every(v => typeof v === "number")` → `VECTOR`
7. All other values → `STRING` (fallback, value is coerced to string)

If a `formula` is provided, the type is always `FORMULA` regardless of the value.

## Null / Empty Cell Semantics

- A missing cell in the worksheet XML is represented as `{ value: null, formula: null, type: "empty" }`
- All rows in a worksheet are padded to the same length with empty cells
- Empty cells are skipped entirely during XML generation (no `<c>` element emitted)

## Error Cell Handling

- Excel error values (`#REF!`, `#VALUE!`, `#N/A`, etc.) are read as `STRING` type
- The error string is preserved as the cell value
- Error cells are written back as regular string cells (shared string reference)
