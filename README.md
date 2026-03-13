# tablsx

`tablsx` is a lightweight ESM Node.js library for reading and writing Excel `.xlsx` files as predictable JavaScript data.

It is designed for data interchange, imports and exports, and programmatic workbook generation rather than full spreadsheet editing.

## Installation

```bash
npm install tablsx
```

## Quick start

```js
import {
  createCell,
  createWorkbook,
  createWorksheet,
  readXlsx,
  writeXlsx,
} from "tablsx";

const workbook = createWorkbook([
  createWorksheet("People", [
    [createCell("name"), createCell("age")],
    [createCell("Ada"), createCell(36)],
    [createCell("Linus"), createCell(54)],
  ]),
]);

const bytes = writeXlsx(workbook);
const parsed = readXlsx(bytes);

console.log(parsed.sheets[0].rows[1][0].value);
// "Ada"
```

## Core capabilities

- Read `.xlsx` workbooks into a normalized JavaScript model
- Write `.xlsx` workbooks from normalized workbook objects
- Convert row objects to worksheets with `sheetFromRows`
- Convert worksheets back to row objects with `rowsFromSheet`
- Build workbooks fluently with `WorkbookBuilder` and `SheetBuilder`
- Work with strings, numbers, booleans, dates, formulas, empty cells, and numeric vectors

## Documentation

- [Getting started](./docs/guide/getting-started.md)
- [Reading workbooks](./docs/guide/reading-workbooks.md)
- [Writing workbooks](./docs/guide/writing-workbooks.md)
- [Tabular workflows](./docs/guide/tabular-workflows.md)
- [Builder API](./docs/guide/builder-api.md)
- [API reference](./docs/reference/index.md)
- [Documentation maintenance](./docs/documentation/docs-maintenance.md)

## Development

```bash
npm test
npm run lint
npm run docs:dev
```
