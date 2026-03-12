# Product Requirements Document: tablsx

**A Node.js library for reading and writing Excel .xlsx files**

Version: 1.0
Status: Draft

---

## Table of Contents

1. [Overview](#1-overview)
2. [Goals and Non-Goals](#2-goals-and-non-goals)
3. [Technology Requirements](#3-technology-requirements)
4. [Architecture](#4-architecture)
5. [Internal Data Model](#5-internal-data-model)
6. [Excel Data Type Support](#6-excel-data-type-support)
7. [Folder Structure](#7-folder-structure)
8. [Phase 1 — Core XLSX Engine (MVP)](#8-phase-1--core-xlsx-engine-mvp)
9. [Phase 2 — Full Data Type Support](#9-phase-2--full-data-type-support)
10. [Phase 3 — Tabular Data Interchange](#10-phase-3--tabular-data-interchange)
11. [Phase 4 — Public Authoring Convenience Layer](#11-phase-4--public-authoring-convenience-layer)
12. [Documentation Requirements](#12-documentation-requirements)
13. [Testing Strategy](#13-testing-strategy)
14. [Performance Considerations](#14-performance-considerations)
15. [Example API Usage](#15-example-api-usage)
16. [Risk Analysis](#16-risk-analysis)

---

## 1. Overview

tablsx is a modern Node.js library for importing and exporting Excel `.xlsx` files. It provides a clean, predictable interface for converting between structured JavaScript data and the Open XML SpreadsheetML format.

The library is designed for **tabular data interchange between systems** — reading database exports, writing reports, round-tripping data through Excel without loss. It prioritizes data correctness, predictable behavior, and simplicity over full Excel feature parity.

### Core Capabilities

- Read `.xlsx` files into structured JavaScript data
- Write `.xlsx` files from structured JavaScript data
- Handle all Excel primitive data types (string, number, boolean, date, empty, formula)
- Convert Excel date serial numbers to JavaScript `Date` objects and back
- Support large tabular datasets (100k+ rows)
- Support vector-style columns (arrays of numbers) for ML/embedding workflows
- Round-trip tabular data without data loss

---

## 2. Goals and Non-Goals

### Goals

- Correct handling of all Excel primitive data types
- Deterministic round-trip behavior: `read → transform → write → read` preserves values and types
- Generic, reusable library with no application-specific dependencies
- Clean separation between parsing, data model, generation, and public API
- Progressive API design: plain data structures first, convenience classes later
- JSON-serializable internal model

### Non-Goals

The following are explicitly out of scope for all phases:

- Excel styling (fonts, colors, borders, cell formatting)
- Charts and chart objects
- Pivot tables
- Macros and VBA
- Conditional formatting
- Formula evaluation engine
- Legacy `.xls` (BIFF) format support
- Image embedding
- Cell comments/notes
- Data validation rules
- Named ranges
- Print layout and page setup

---

## 3. Technology Requirements

| Requirement | Value |
|---|---|
| Language | JavaScript (Node.js) |
| Runtime | Node.js 18+ |
| Module system | ESM (with CJS compatibility) |
| Excel format | `.xlsx` (Open XML SpreadsheetML, ECMA-376) |
| Test framework | Node.js built-in test runner (`node:test`) or vitest |

### External Dependencies

The implementation may use existing libraries for:

- **ZIP container handling** — reading and writing `.xlsx` ZIP archives (e.g., `fflate`, `yazl`/`yauzl`, or `archiver`/`unzipper`)
- **XML parsing** — parsing and generating Open XML documents (e.g., `fast-xml-parser`, `sax`)

All Excel-specific parsing and generation logic (shared strings, cell type resolution, date serial conversion, worksheet structure) must be implemented within the library itself. The library must not depend on existing xlsx libraries (e.g., `exceljs`, `xlsx`, `sheetjs`).

---

## 4. Architecture

### Architectural Principles

1. **Internal Data Model First** — The reader and writer operate on a plain JavaScript data model that is easy to serialize, inspect, and test.
2. **Separation of Concerns** — File parsing, internal data model, file generation, and developer-facing API are distinct layers.
3. **Progressive API Design** — Start with plain data structures (Phases 1–3), then introduce classes as a convenience layer (Phase 4).
4. **Deterministic Round-Trip Behavior** — `read → transform → write → read` must preserve values and types.

### System Layers

```
┌─────────────────────────────────────────────┐
│              Public API Layer               │  Phase 4
│     (WorkbookBuilder, convenience methods)  │
├─────────────────────────────────────────────┤
│           Tabular Data Layer                │  Phase 3
│    (sheetFromRows, rowsFromSheet, schema)   │
├─────────────────────────────────────────────┤
│          Internal Data Model                │  Phase 1
│    (Workbook, Worksheet, Cell — plain JS)   │
├──────────────────┬──────────────────────────┤
│     Reader       │        Writer            │  Phase 1
│  ZIP → XML →     │   Model → XML →          │
│  Model           │   ZIP                    │
├──────────────────┴──────────────────────────┤
│              Utilities                      │  Phase 1–2
│  (cell refs, dates, shared strings, vectors)│
└─────────────────────────────────────────────┘
```

### Read Pipeline

```
.xlsx file (Buffer)
  → ZIP decompression
    → Extract XML parts:
        [Content_Types].xml
        _rels/.rels
        xl/workbook.xml
        xl/_rels/workbook.xml.rels
        xl/worksheets/sheet1.xml ... sheetN.xml
        xl/sharedStrings.xml
    → Parse shared strings table
    → For each worksheet XML:
        → Parse cell elements
        → Resolve shared string references
        → Resolve cell types (string, number, boolean, date, formula)
        → Build Cell objects
    → Assemble Workbook model
```

### Write Pipeline

```
Workbook model
  → Build shared strings table (deduplicated)
  → For each worksheet:
      → Generate worksheet XML from Cell objects
  → Generate workbook.xml, relationships, content types
  → Package all XML parts into ZIP
  → Output .xlsx file (Buffer)
```

---

## 5. Internal Data Model

The core data model uses plain JavaScript objects and arrays. No classes. All structures must be JSON-serializable (with the exception of `Date` values, which serialize to ISO strings).

### Workbook

```js
{
  sheets: [Worksheet, ...]
}
```

### Worksheet

```js
{
  name: string,       // Sheet name (unique within workbook)
  rows: Cell[][]       // 2D array: rows[rowIndex][colIndex]
}
```

### Cell

```js
{
  value: CellValue,        // The cell's resolved value
  formula: string | null,  // Formula string (without leading =), or null
  type: CellType           // Explicit type tag
}
```

### CellValue

```
string | number | boolean | Date | null | number[]
```

### CellType

```
"string" | "number" | "boolean" | "date" | "empty" | "formula" | "vector"
```

### Type Resolution Rules

| `type` | `value` | `formula` | Notes |
|---|---|---|---|
| `"string"` | `string` | `null` | |
| `"number"` | `number` | `null` | |
| `"boolean"` | `boolean` | `null` | |
| `"date"` | `Date` | `null` | Stored as serial number in Excel |
| `"empty"` | `null` | `null` | Missing or blank cell |
| `"formula"` | `string \| number \| null` | `string` | Value is cached result; formula is stored but not evaluated |
| `"vector"` | `number[]` | `null` | Serialized as JSON string in Excel cells |

### Design Constraints

- Sparse rows are not used. Empty cells are represented as `{ value: null, formula: null, type: "empty" }`.
- All rows in a worksheet have the same length (padded with empty cells if necessary).
- Sheet names must be unique within a workbook.
- The model does not store styling, formatting, or metadata beyond the cell data itself.

---

## 6. Excel Data Type Support

### Excel Open XML Cell Types

The `.xlsx` format uses a `t` attribute on `<c>` (cell) elements to indicate type:

| Excel `t` attribute | Meaning | JavaScript mapping |
|---|---|---|
| `s` | Shared string index | `string` (resolved via shared strings table) |
| `inlineStr` | Inline string | `string` |
| `n` (or absent) | Number | `number` or `Date` (if date-formatted) |
| `b` | Boolean | `boolean` (`0` → `false`, `1` → `true`) |
| `e` | Error | `string` (e.g., `"#REF!"`) |
| `str` | Formula string result | `string` (with formula stored) |

### Date Handling

Excel stores dates as serial numbers (days since 1900-01-01, with the Lotus 1-2-3 leap year bug for dates before 1900-03-01). The library must:

1. **On read**: Detect date-formatted cells using number format information from `xl/styles.xml` and convert serial numbers to JavaScript `Date` objects.
2. **On write**: Convert JavaScript `Date` objects to Excel serial numbers and apply a date number format.

Key functions:

- `excelDateToJS(serial: number): Date` — Convert Excel serial number to JS Date (UTC)
- `jsDateToExcel(date: Date): number` — Convert JS Date to Excel serial number
- Both must handle the 1900 leap year bug correctly (serial 60 = 1900-02-29 which does not exist)

### Vector Column Handling

Vector/embedding columns (`number[]`) are not a native Excel type. The library handles them as follows:

- **On write**: Serialize `number[]` to a JSON string (e.g., `"[0.1,0.2,0.3]"`) and store as a regular string cell.
- **On read**: Optionally detect JSON array strings and parse them back to `number[]` when the caller indicates a column is a vector type (via schema or options).
- Round-trip: `number[]` → JSON string → `number[]` must be lossless for standard floating-point values.

---

## 7. Folder Structure

```
src/
  index.js                  # Public API entry point
  model/
    workbook.js             # Workbook, Worksheet, Cell factory functions
    types.js                # Type constants and type guards
  reader/
    index.js                # readXlsx() entry point
    zip.js                  # ZIP extraction
    workbook-parser.js      # Parse xl/workbook.xml
    worksheet-parser.js     # Parse xl/worksheets/sheetN.xml
    shared-strings.js       # Parse xl/sharedStrings.xml
    styles-parser.js        # Parse xl/styles.xml (for date detection)
  writer/
    index.js                # writeXlsx() entry point
    zip.js                  # ZIP packaging
    workbook-writer.js      # Generate xl/workbook.xml + relationships
    worksheet-writer.js     # Generate xl/worksheets/sheetN.xml
    shared-strings-writer.js # Generate xl/sharedStrings.xml
    styles-writer.js        # Generate xl/styles.xml
    content-types.js        # Generate [Content_Types].xml
  tabular/
    index.js                # sheetFromRows(), rowsFromSheet()
    schema.js               # Schema inference and column typing
    serializer.js           # Row object → Cell[] conversion
    parser.js               # Cell[] → row object conversion
  builder/
    workbook-builder.js     # WorkbookBuilder class
    sheet-builder.js        # SheetBuilder class
  utils/
    cell-ref.js             # A1 ↔ {row, col} conversion
    dates.js                # Excel date ↔ JS Date conversion
    xml.js                  # XML escaping and helpers
    vectors.js              # Vector serialization/deserialization

test/
  reader/
  writer/
  tabular/
  builder/
  utils/
  fixtures/                 # .xlsx test files and expected outputs
    excel-generated/        # Files created in real Excel
    synthetic/              # Programmatically generated test files
```

---

## 8. Phase 1 — Core XLSX Engine (MVP)

### Goal

Build a minimal, working Excel reader and writer that handles the most common cell types and multiple sheets.

### Scope

**Reader (`readXlsx`)**

- Accept a `Buffer` (or `Uint8Array`) containing an `.xlsx` file
- Decompress the ZIP container
- Parse the required XML parts:
  - `[Content_Types].xml`
  - `_rels/.rels`
  - `xl/workbook.xml` (sheet list and ordering)
  - `xl/_rels/workbook.xml.rels` (sheet → file mapping)
  - `xl/sharedStrings.xml` (shared string table)
  - `xl/worksheets/sheet*.xml` (cell data)
- Resolve shared string references
- Handle cell types: string (`s`, `inlineStr`), number (`n`), boolean (`b`), empty
- Return a `Workbook` object

**Writer (`writeXlsx`)**

- Accept a `Workbook` object
- Build a deduplicated shared strings table
- Generate all required XML parts
- Package into a ZIP container
- Return a `Buffer` containing the `.xlsx` file

**Data Model**

- `createWorkbook()`, `createWorksheet()`, `createCell()` factory functions
- Enforce row-length consistency within each worksheet

**Utilities**

- `encodeCellRef(row, col)` → `"A1"` (0-indexed)
- `decodeCellRef("A1")` → `{ row: 0, col: 0 }`
- `columnToLetter(col)` → `"A"`, `"Z"`, `"AA"`, etc.
- XML string escaping

### API Surface

```js
import { readXlsx, writeXlsx } from 'tablsx'

// Read
const workbook = readXlsx(buffer)
// workbook.sheets[0].name → "Sheet1"
// workbook.sheets[0].rows[0][0].value → "Hello"

// Write
const outputBuffer = writeXlsx(workbook)
```

### Acceptance Criteria

- Can round-trip a multi-sheet workbook with string, number, boolean, and empty cells
- Output `.xlsx` files open correctly in Microsoft Excel and Google Sheets
- All cells preserve their values through read → write → read

---

## 9. Phase 2 — Full Data Type Support

### Goal

Complete data type coverage for all Excel cell value types, including dates, formulas, and vectors.

### Scope

**Date Support**

- Parse `xl/styles.xml` to extract number format definitions
- Identify date-formatted cells by their style index (`s` attribute on `<c>` elements) cross-referenced with number format patterns
- Implement `excelDateToJS(serial)` and `jsDateToExcel(date)`:
  - Handle the 1900 leap year bug (Excel incorrectly treats 1900 as a leap year)
  - Handle time-only values (serial < 1)
  - Handle date+time values (fractional serial numbers)
- On write: assign a default date number format (e.g., `yyyy-mm-dd`) and write the serial number

**Formula Support**

- On read: extract the `<f>` element from cells and store as `formula` in the Cell object
- On read: extract the cached value from `<v>` and store as `value`
- On write: emit both `<f>` and `<v>` elements
- Formulas are **stored only**, never evaluated

**Boolean Encoding**

- On read: `<v>1</v>` with `t="b"` → `true`, `<v>0</v>` → `false`
- On write: `true` → `<v>1</v>`, `false` → `<v>0</v>`, both with `t="b"`

**Numeric Precision**

- Preserve full `number` precision (IEEE 754 double)
- Do not truncate or round values during read or write

**Vector Support**

- `vectors.js` utility:
  - `serializeVector(arr: number[]): string` — encode as JSON string `"[1,2,3]"`
  - `deserializeVector(str: string): number[]` — parse JSON array string
  - `isVectorString(str: string): boolean` — detect JSON array pattern
- On write: vector cells are written as string cells containing the JSON serialization
- On read: vector deserialization is opt-in (see Phase 3 schema support)

### New Utilities

```js
excelDateToJS(serial)    // → Date
jsDateToExcel(date)      // → number
serializeVector(arr)     // → string
deserializeVector(str)   // → number[]
```

### Acceptance Criteria

- Dates round-trip correctly: `Date` → serial → `Date` preserves year/month/day/hour/minute/second
- Dates before 1900-03-01 are handled correctly (1900 bug)
- Time-only values (`0.5` = noon) round-trip correctly
- Formulas are preserved through round-trip (stored, not evaluated)
- Boolean values round-trip correctly
- Vector arrays round-trip through JSON serialization without precision loss

---

## 10. Phase 3 — Tabular Data Interchange

### Goal

Provide high-level functions for converting between arrays of row objects and worksheets, with schema inference and column typing.

### Scope

**Core Functions**

- `sheetFromRows(rows, options?)` — Convert an array of plain objects into a `Worksheet`
  - First row becomes column headers
  - Values are typed automatically based on JavaScript type
  - Options allow explicit column type overrides (e.g., mark a column as `"vector"` or `"date"`)
- `rowsFromSheet(sheet, options?)` — Convert a `Worksheet` into an array of plain objects
  - First row is used as property keys
  - Cell values are resolved to JavaScript types
  - Options allow specifying which columns should be parsed as vectors

**Schema Inference**

- `inferSchema(sheet)` — Analyze a worksheet and return column metadata:
  ```js
  {
    columns: [
      { name: "id", type: "number", nullable: false },
      { name: "name", type: "string", nullable: false },
      { name: "embedding", type: "vector", nullable: true },
      { name: "created_at", type: "date", nullable: false }
    ]
  }
  ```
- Type inference examines all non-header rows and picks the dominant type
- Vector detection: columns where all non-null values are valid JSON arrays of numbers

**Column Type Override**

```js
const rows = rowsFromSheet(sheet, {
  columns: {
    embedding: { type: 'vector' },
    created_at: { type: 'date' }
  }
})
```

**Row Serialization**

- Objects are serialized to cell arrays based on column order derived from the first object's keys (or an explicit column list)
- Handles `undefined` and missing properties as empty cells
- Handles nested values by JSON-stringifying them

### API Surface

```js
import { sheetFromRows, rowsFromSheet, inferSchema } from 'tablsx'

// Export: objects → worksheet
const sheet = sheetFromRows([
  { id: 1, name: 'Alice', embedding: [0.1, 0.2, 0.3] },
  { id: 2, name: 'Bob',   embedding: [0.4, 0.5, 0.6] }
])

// Import: worksheet → objects
const rows = rowsFromSheet(sheet, {
  columns: { embedding: { type: 'vector' } }
})
// → [{ id: 1, name: 'Alice', embedding: [0.1, 0.2, 0.3] }, ...]

// Schema inference
const schema = inferSchema(sheet)
```

### Acceptance Criteria

- `sheetFromRows(rows)` → `rowsFromSheet(sheet)` round-trips all supported types
- Schema inference correctly identifies string, number, boolean, date, and vector columns
- Explicit column type overrides work for vector and date columns
- Missing/undefined values in row objects become empty cells
- Header names are preserved exactly

---

## 11. Phase 4 — Public Authoring Convenience Layer

### Goal

Provide a developer-friendly builder API for constructing workbooks programmatically. The builder wraps the internal data model — it does not replace it.

### Scope

**WorkbookBuilder**

```js
class WorkbookBuilder {
  static create()                    // → WorkbookBuilder
  sheet(name: string)                // → SheetBuilder (creates or returns existing)
  build()                            // → Workbook (internal data model)
}
```

**SheetBuilder**

```js
class SheetBuilder {
  addRow(values: any[])              // Append a row of raw values
  addRows(rows: any[][])             // Append multiple rows
  addObjects(objects: object[])      // Append rows from objects (first call sets headers)
  setHeaders(headers: string[])      // Explicitly set column headers
  build()                            // → Worksheet (internal data model)
}
```

**Integration with read/write**

```js
import { WorkbookBuilder, writeXlsx } from 'tablsx'

const wb = WorkbookBuilder.create()
const sheet = wb.sheet('Employees')
sheet.addRow(['Name', 'Age', 'Start Date'])
sheet.addRow(['Alice', 30, new Date('2024-01-15')])
sheet.addRow(['Bob', 25, new Date('2024-06-01')])

const buffer = writeXlsx(wb.build())
```

**Type Inference in Builder**

The builder automatically infers cell types from JavaScript values:

| JavaScript value | Inferred `CellType` |
|---|---|
| `string` | `"string"` |
| `number` | `"number"` |
| `boolean` | `"boolean"` |
| `Date` instance | `"date"` |
| `null` / `undefined` | `"empty"` |
| `number[]` | `"vector"` |

**Object-Based Row Insertion**

```js
const data = [
  { name: 'Alice', age: 30, embedding: [0.1, 0.2] },
  { name: 'Bob',   age: 25, embedding: [0.3, 0.4] }
]

const sheet = wb.sheet('Data')
sheet.addObjects(data)
// Automatically sets headers from first object's keys
// Subsequent objects are matched by key name
```

### Design Constraint

The builder must always produce the same internal `Workbook`/`Worksheet`/`Cell` structures used by the reader and writer. It is a convenience layer, not an alternative data path.

### Acceptance Criteria

- Builder-created workbooks produce valid `.xlsx` files
- `addObjects` correctly maps object keys to column headers
- Type inference matches the same rules used in `sheetFromRows`
- `wb.build()` returns a standard `Workbook` object compatible with `writeXlsx`

---

## 12. Documentation Requirements

### Architecture Decision Records (ADR)

The project must maintain Architecture Decision Records documenting key design decisions. ADRs provide a historical record of significant choices and their rationale, enabling contributors to understand why the system works the way it does.

**Location:** `docs/adr/`

**Format:** Each ADR is a numbered markdown file following a consistent template.

```
docs/adr/
  0001-internal-data-model.md
  0002-shared-strings-strategy.md
  0003-vector-serialization-format.md
  0004-date-detection-approach.md
  0005-api-design-plain-objects-vs-classes.md
  ...
```

**ADR Template:**

```markdown
# ADR-NNNN: Title

## Status
Proposed | Accepted | Deprecated | Superseded by ADR-NNNN

## Context
What is the issue that we're seeing that is motivating this decision?

## Decision
What is the change that we're proposing and/or doing?

## Alternatives Considered
What other approaches were evaluated? Why were they rejected?

## Consequences
What becomes easier or more difficult as a result of this decision?
```

**Required ADRs (to be written during implementation):**

| ADR | Phase | Topic |
|---|---|---|
| ADR-0001 | 1 | Internal data model: plain objects vs classes |
| ADR-0002 | 1 | Shared strings strategy: eagerly loaded array vs lazy map |
| ADR-0003 | 1 | ZIP and XML library selection |
| ADR-0004 | 2 | Date detection: styles.xml parsing vs heuristic |
| ADR-0005 | 2 | Vector serialization: JSON string vs delimited format |
| ADR-0006 | 2 | Formula handling: store-only approach |
| ADR-0007 | 3 | Schema inference algorithm |
| ADR-0008 | 4 | Builder API: builder pattern vs fluent interface |

### Rules Documentation

The project must maintain explicit rules documentation describing the behavioral contracts of the library. Rules documentation ensures consistent behavior and serves as a reference for contributors and consumers.

**Location:** `docs/rules/`

```
docs/rules/
  type-conversion.md
  date-handling.md
  vector-serialization.md
  header-detection.md
  round-trip-guarantees.md
  limitations.md
```

**Required Rules Documents:**

**type-conversion.md** — Defines the mapping between Excel cell types and JavaScript types.
- Excel `t` attribute to JavaScript type mapping
- Ambiguous type resolution order
- Null/empty cell semantics
- Error cell handling

**date-handling.md** — Defines the rules for Excel date serial number conversion.
- 1900 date system baseline
- Lotus 1-2-3 leap year bug behavior (serial 60)
- Time-only value handling (serial < 1)
- Date+time fractional serial handling
- Timezone treatment (UTC convention)
- Known date number format patterns used for detection

**vector-serialization.md** — Defines the rules for vector/embedding column encoding.
- JSON array string format specification
- Precision guarantees
- Deserialization detection heuristics
- Opt-in vs automatic detection behavior

**header-detection.md** — Defines the rules for first-row-as-headers behavior.
- When headers are assumed vs explicit
- Duplicate header name handling
- Empty header cell handling
- Header normalization rules (if any)

**round-trip-guarantees.md** — Defines what the library guarantees about data preservation.
- Types that round-trip exactly
- Known precision boundaries (floating-point)
- Formula round-trip behavior (stored, not evaluated)
- Vector round-trip behavior (JSON string intermediary)
- What is NOT preserved (styling, metadata, named ranges, etc.)

**limitations.md** — Documents known limitations and out-of-scope behaviors.
- Unsupported Excel features
- Maximum row/column limits
- Sparse worksheet handling
- Rich text stripping behavior
- Error cell handling

---

## 13. Testing Strategy

### Test Categories

**Unit Tests**

- Cell reference encoding/decoding (`A1` ↔ `{row: 0, col: 0}`, `AA1` ↔ `{row: 0, col: 26}`)
- Date conversion (`excelDateToJS`, `jsDateToExcel`), including edge cases:
  - 1900 leap year bug boundary (serial 59, 60, 61)
  - Time-only values (serial 0.5 = 12:00 noon)
  - Date+time values
  - Epoch boundaries
- Vector serialization/deserialization
- XML escaping
- Shared string table construction and lookup
- Type inference logic
- Schema inference

**Integration Tests — Round-Trip**

- Create a workbook with all supported types → write → read → compare
- Multi-sheet workbooks
- Worksheets with mixed column types in the same row
- Empty worksheets
- Worksheets with only headers (no data rows)
- Single-cell worksheets

**Integration Tests — Compatibility**

- Read `.xlsx` files generated by Microsoft Excel (stored in `test/fixtures/excel-generated/`)
- Read `.xlsx` files generated by Google Sheets
- Read `.xlsx` files generated by LibreOffice Calc
- Verify that written `.xlsx` files open without errors in these applications

**Tabular Data Tests**

- `sheetFromRows` → `rowsFromSheet` round-trip with all types
- Schema inference on mixed-type columns
- Vector column round-trip through JSON serialization
- Missing/null value handling
- Objects with inconsistent keys

**Large Dataset Tests**

- 100,000 rows × 20 columns with mixed types
- Measure read time, write time, and peak memory usage
- Verify correctness of first row, last row, and sampled rows

### Test Fixtures

```
test/fixtures/
  excel-generated/
    basic-types.xlsx          # String, number, boolean, empty
    dates.xlsx                # Various date formats
    formulas.xlsx             # Cells with formulas and cached values
    multi-sheet.xlsx          # Multiple worksheets
    large-dataset.xlsx        # 10k+ rows
  synthetic/
    all-types.json            # Expected output for all-types test
    round-trip-input.json     # Input data for round-trip tests
```

### Coverage Target

- Line coverage: 90%+
- Branch coverage: 85%+
- All date edge cases must have explicit test cases

---

## 14. Performance Considerations

### Targets

| Operation | Target | Dataset |
|---|---|---|
| Read | < 5 seconds | 100k rows × 20 columns |
| Write | < 5 seconds | 100k rows × 20 columns |
| Peak memory | < 500 MB | 100k rows × 20 columns |

### Strategies

**Efficient XML Parsing**

- Use a SAX-style or streaming XML parser for worksheet parsing (worksheets are typically the largest XML files)
- Avoid building a full DOM tree for large worksheets
- Parse shared strings eagerly (they are typically small relative to worksheet data)

**Shared String Optimization**

- On write: deduplicate strings using a `Map` for O(1) lookup
- On read: build the shared strings array once, then index into it

**Memory Management**

- Represent the cell grid as a flat 2D array (not sparse objects) for predictable memory layout
- Avoid intermediate string concatenation for large XML generation — use array join or buffer writes

**Future Streaming Support**

The architecture should not preclude a future streaming writer that emits rows incrementally without holding the entire workbook in memory. This means:

- The writer should process one worksheet at a time
- Shared strings can be collected in a first pass, then referenced in a second pass
- ZIP packaging should support streaming entry addition

This is noted as a future consideration, not a Phase 1–4 requirement.

---

## 15. Example API Usage

### Basic Read and Write (Phase 1)

```js
import { readXlsx, writeXlsx } from 'tablsx'
import { readFile, writeFile } from 'node:fs/promises'

// Read an Excel file
const buffer = await readFile('input.xlsx')
const workbook = readXlsx(buffer)

console.log(workbook.sheets.length)            // 2
console.log(workbook.sheets[0].name)           // "Sheet1"
console.log(workbook.sheets[0].rows[0][0])     // { value: "Name", formula: null, type: "string" }
console.log(workbook.sheets[0].rows[1][0])     // { value: "Alice", formula: null, type: "string" }
console.log(workbook.sheets[0].rows[1][1])     // { value: 30, formula: null, type: "number" }

// Write back to Excel
const output = writeXlsx(workbook)
await writeFile('output.xlsx', output)
```

### Date and Formula Handling (Phase 2)

```js
import { readXlsx, excelDateToJS, jsDateToExcel } from 'tablsx'

const workbook = readXlsx(buffer)
const cell = workbook.sheets[0].rows[1][2]

// Date cell
console.log(cell.type)       // "date"
console.log(cell.value)      // Date object: 2024-01-15T00:00:00.000Z

// Formula cell
const formulaCell = workbook.sheets[0].rows[1][3]
console.log(formulaCell.type)      // "formula"
console.log(formulaCell.formula)   // "SUM(A1:A10)"
console.log(formulaCell.value)     // 42 (cached result)

// Utility functions
const serial = jsDateToExcel(new Date('2024-06-15'))  // 45458
const date = excelDateToJS(45458)                      // 2024-06-15T00:00:00.000Z
```

### Tabular Data Interchange (Phase 3)

```js
import { readXlsx, writeXlsx, sheetFromRows, rowsFromSheet, inferSchema } from 'tablsx'

// Export: database rows → Excel
const dbRows = [
  { id: 1, name: 'Alice', score: 95.5, embedding: [0.1, 0.2, 0.3], created: new Date('2024-01-15') },
  { id: 2, name: 'Bob',   score: 87.0, embedding: [0.4, 0.5, 0.6], created: new Date('2024-02-20') }
]

const sheet = sheetFromRows(dbRows)
const workbook = { sheets: [sheet] }
const buffer = writeXlsx(workbook)

// Import: Excel → structured objects
const imported = readXlsx(buffer)
const rows = rowsFromSheet(imported.sheets[0], {
  columns: {
    embedding: { type: 'vector' },
    created: { type: 'date' }
  }
})
// rows[0].embedding → [0.1, 0.2, 0.3]
// rows[0].created → Date object

// Schema inference
const schema = inferSchema(imported.sheets[0])
// schema.columns → [
//   { name: 'id', type: 'number', nullable: false },
//   { name: 'name', type: 'string', nullable: false },
//   { name: 'score', type: 'number', nullable: false },
//   { name: 'embedding', type: 'vector', nullable: false },
//   { name: 'created', type: 'date', nullable: false }
// ]
```

### Builder API (Phase 4)

```js
import { WorkbookBuilder, writeXlsx } from 'tablsx'

const wb = WorkbookBuilder.create()

// Manual row construction
const employees = wb.sheet('Employees')
employees.addRow(['Name', 'Age', 'Department', 'Start Date'])
employees.addRow(['Alice', 30, 'Engineering', new Date('2024-01-15')])
employees.addRow(['Bob', 25, 'Design', new Date('2024-06-01')])

// Object-based construction
const embeddings = wb.sheet('Embeddings')
embeddings.addObjects([
  { text: 'hello world', vector: [0.1, 0.2, 0.3, 0.4] },
  { text: 'goodbye',     vector: [0.5, 0.6, 0.7, 0.8] }
])

const buffer = writeXlsx(wb.build())
```

---

## 16. Risk Analysis

### Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| **Date detection unreliable** — Identifying date cells requires parsing `styles.xml` number formats, which have many variations | High | High | Maintain a curated list of known date format patterns. Provide fallback heuristics. Allow caller override via column type options. |
| **Large file memory pressure** — 100k+ row worksheets can produce very large XML strings | Medium | High | Use SAX-style XML parsing for reads. Consider chunked XML generation for writes. Profile early with large datasets. |
| **Floating-point precision loss** — IEEE 754 double precision may cause subtle differences in round-trip | Low | Medium | Use `Number.parseFloat` and avoid intermediate string conversions where possible. Test with known precision edge cases. |
| **Excel compatibility gaps** — Different Excel versions and applications (Google Sheets, LibreOffice) produce slightly different `.xlsx` structures | High | Medium | Test against files from multiple sources. Parse defensively (tolerate missing optional elements). Use a compatibility test suite. |
| **Shared strings edge cases** — Rich text, phonetic runs, and other shared string variants | Medium | Low | Support plain `<t>` elements initially. Log warnings for unsupported rich text. Treat rich text as plain text (strip formatting). |
| **ZIP library compatibility** — Different ZIP libraries handle edge cases differently (ZIP64, unicode filenames) | Low | Medium | Choose a well-maintained ZIP library. Test with files from multiple sources. |

### Process Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| **Scope creep into styling** — Users will request cell formatting, colors, fonts | High | Medium | Clearly document non-goals. Design the internal model so styling could be added later without breaking changes, but do not implement it. |
| **ECMA-376 spec complexity** — The Open XML specification is large and complex | Medium | Medium | Focus on the subset used by real-world files. Test against actual files, not just the spec. |
| **Vector format fragility** — JSON-in-cell is a convention, not a standard | Low | Low | Document the convention clearly. Use strict JSON parsing. Provide clear error messages for malformed vectors. |

---

*End of document.*
