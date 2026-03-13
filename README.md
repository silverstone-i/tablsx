# tablsx

`tablsx` is a lightweight ESM Node.js library for reading and writing Excel `.xlsx` files as predictable JavaScript data.

It is designed for data interchange, imports and exports, and programmatic workbook generation rather than full spreadsheet editing.

## Installation

```bash
npm install @nap-sft/tablsx
```

## Quick start

```js
import {
  createCell,
  createWorkbook,
  createWorksheet,
  readXlsx,
  writeXlsx,
} from "@nap-sft/tablsx";

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

Full documentation is available at **[silverstone-i.github.io/tablsx](https://silverstone-i.github.io/tablsx/)**.

- [Getting started](https://silverstone-i.github.io/tablsx/guide/getting-started)
- [Choosing an API](https://silverstone-i.github.io/tablsx/guide/choosing-an-api)
- [Reading workbooks](https://silverstone-i.github.io/tablsx/guide/reading-workbooks)
- [Writing workbooks](https://silverstone-i.github.io/tablsx/guide/writing-workbooks)
- [Tabular workflows](https://silverstone-i.github.io/tablsx/guide/tabular-workflows)
- [Builder API](https://silverstone-i.github.io/tablsx/guide/builder-api)
- [Reader API](https://silverstone-i.github.io/tablsx/guide/reader-api)
- [API reference](https://silverstone-i.github.io/tablsx/reference/)

## Development

```bash
npm test
npm run lint
npm run docs:dev
```
