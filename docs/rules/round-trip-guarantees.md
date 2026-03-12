# Round-Trip Guarantees

Defines what the library guarantees about data preservation through `read → write → read` cycles.

## Guaranteed Round-Trip Types

The following cell types are preserved exactly through a full cycle:

| Type | Guarantee |
|---|---|
| `STRING` | Exact string value preserved (including whitespace, special characters, XML entities) |
| `NUMBER` | Full IEEE 754 double precision preserved |
| `BOOLEAN` | `true`/`false` preserved exactly |
| `DATE` | Year, month, day, hour, minute, second preserved (milliseconds may have sub-ms rounding from serial conversion) |
| `EMPTY` | Empty cells remain empty |
| `FORMULA` | Formula string and cached value both preserved |
| `VECTOR` | Written as JSON string via shared strings; read back as `STRING` in Phase 1 (reader does not yet deserialize vectors) |

## Cell Structure Preservation

Each cell's three properties are preserved:
- `value` — the resolved value (per type rules above)
- `formula` — the formula string (without leading `=`), or `null`
- `type` — the `CellType` enum value

## Worksheet Structure Preservation

- Sheet names are preserved exactly
- Sheet ordering is preserved
- Row count and column count are preserved
- All rows within a sheet have the same length (enforced by `normalizeRows()`)

## Floating-Point Precision

- Numbers are written as full-precision strings (no truncation or rounding)
- `JSON.stringify(number)` is used for XML output, which preserves all significant digits
- Date serial conversion uses `Math.round()` on milliseconds to avoid sub-millisecond drift

## Formula Round-Trip

- The formula string is stored without the leading `=` sign
- The cached result value is preserved (may be `string`, `number`, or `null`)
- Formulas are **not evaluated** — the cached value may be stale relative to the data
- When Excel opens a file written by tablsx, it may recalculate formulas

## Vector Round-Trip

- `number[]` → `JSON.stringify()` → string cell → `JSON.parse()` → `number[]`
- Precision is limited to `JSON.stringify` output for each element
- Standard floating-point values round-trip exactly
- Array element order is preserved
- Empty arrays (`[]`) round-trip correctly

## What is NOT Preserved

The following are explicitly not preserved through round-trip:

- **Cell styling** — fonts, colors, borders, cell formatting are discarded on read
- **Number formats** — only the date format detection is used; custom number formats are not preserved
- **Named ranges** — not parsed or written
- **Cell comments/notes** — not parsed or written
- **Data validation** — not parsed or written
- **Conditional formatting** — not parsed or written
- **Charts** — not parsed or written
- **Images** — not parsed or written
- **Macros/VBA** — not parsed or written
- **Print layout** — not parsed or written
- **Rich text formatting** — rich text is flattened to plain text
- **Merged cells** — merge information is not preserved
- **Column widths and row heights** — not preserved
- **Frozen panes and filters** — not preserved
- **Sheet-level metadata** — only name and cell data are preserved

## Multi-Sheet Round-Trip

- All sheets in a workbook are independently round-tripped
- Sheet order matches the order in `xl/workbook.xml`
- Sheet-to-file mapping is resolved via `xl/_rels/workbook.xml.rels`
