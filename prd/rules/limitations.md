# Known Limitations

Documents known limitations, unsupported features, and out-of-scope behaviors.

## Unsupported Excel Features

The following Excel features are explicitly out of scope and will not be supported:

- Cell styling (fonts, colors, borders, cell formatting)
- Charts and chart objects
- Pivot tables
- Macros and VBA
- Conditional formatting
- Formula evaluation engine
- Legacy `.xls` (BIFF) format
- Image embedding
- Cell comments/notes
- Data validation rules
- Named ranges
- Print layout and page setup
- Merged cells
- Column widths and row heights
- Frozen panes and filters
- Hyperlinks
- Sheet protection and workbook protection

## Row and Column Limits

- No enforced maximum row or column count in the library
- Excel's limits apply when files are opened in Excel: 1,048,576 rows × 16,384 columns
- Column letter encoding supports arbitrary column indices (A, Z, AA, AAA, etc.)
- Performance degrades with very large datasets — see performance targets in the PRD

## Grid Dimensions and Empty Cells

- The writer skips empty cells in the XML output — no `<c>` element is emitted for cells with type `"empty"`
- On round-trip, trailing empty columns and all-empty rows are not preserved because the reader infers grid dimensions only from non-empty cells
- A row `["A", EMPTY, EMPTY]` will round-trip as `["A"]` since the trailing empty cells produce no XML
- Interior empty cells (between non-empty cells) are preserved: `["A", EMPTY, "C"]` round-trips correctly
- This matches Excel's own behavior — Excel does not emit `<c>` elements for trailing empty cells
- If exact grid dimensions must survive round-trip, callers should store dimensions externally or use a sentinel value

## Sparse Worksheet Handling

- The library does not use sparse representation
- All rows are stored as dense arrays with the same column count
- Shorter rows are padded with `{ value: null, formula: null, type: "empty" }` cells
- A worksheet with data at A1 and Z1 will have 26 cells in that row, with 24 empty cells between them
- **OOM protection**: if the dense grid implied by cell references would exceed 10,000,000 cells (e.g., a single cell at `XFD1048576`), the reader compacts the grid to span only the rows and columns that contain data, remapping indices accordingly. This prevents out-of-memory crashes from adversarial or malformed files but means the original absolute cell positions are not preserved for extremely sparse worksheets

## Rich Text

- Rich text entries in shared strings (`<si><r>...</r></si>`) are flattened to plain text
- All formatting runs are concatenated — bold, italic, font changes, etc. are stripped
- The plain text content is preserved accurately

## Error Cells

- Excel error values (`#REF!`, `#VALUE!`, `#N/A`, `#DIV/0!`, `#NAME?`, `#NULL!`, `#NUM!`) are read as `STRING` type
- The error string is preserved as the cell value
- Writing these values back produces regular string cells, not Excel error cells
- Error cells are not round-tripped as errors — they become strings

## Inline Strings

- Inline strings (`<c t="inlineStr"><is><t>text</t></is></c>`) are supported on read
- On write, strings are written via the shared strings table whenever possible, but in some edge cases (for example, explicit `STRING` cells with null values or missing shared string entries) the writer may emit inline strings (`t="inlineStr"`) as a fallback

## Date Limitations

- The 1904 date system (used by some Mac-created Excel files) is not supported — only the 1900 system
- Serial number 60 (the phantom February 29, 1900) is collapsed onto February 28, 1900 — the phantom leap day does not produce a non-existent date
- Millisecond precision may have sub-millisecond rounding due to floating-point conversion
- Date detection requires `xl/styles.xml` — files without styles treat all numeric cells as numbers

## Formula Limitations

- Formulas are stored only, never evaluated
- Formula dependencies and references are not tracked
- Array formulas are not specially handled (stored as regular formulas)
- Shared formulas are not expanded — each cell stores its own formula string

## Encoding

- All XML is assumed to be UTF-8 encoded
- The library generates UTF-8 output
- Non-UTF-8 encoded `.xlsx` files may not parse correctly

## File Format

- Only `.xlsx` (Open XML SpreadsheetML, ECMA-376) is supported
- `.xlsm` (macro-enabled), `.xlsb` (binary), `.xls` (BIFF), `.ods` (OpenDocument) are not supported
- Encrypted/password-protected `.xlsx` files are not supported
