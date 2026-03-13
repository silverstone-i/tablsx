# Getting Started

`tablsx` is an ESM-first Node.js package for reading and writing Excel `.xlsx` files.

## Requirements

- Node.js 18 or newer
- An ESM project, or a build step that supports ESM imports

## Install

```bash
npm install tablsx
```

## First round trip

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
    [createCell("name"), createCell("age"), createCell("active")],
    [createCell("Ada"), createCell(36), createCell(true)],
    [createCell("Linus"), createCell(54), createCell(false)],
  ]),
]);

const bytes = writeXlsx(workbook);
const parsed = readXlsx(bytes);

console.log(parsed.sheets[0].rows[1][0].value);
// "Ada"
```

## Choose the right API

- Use `readXlsx` and `writeXlsx` when you want direct control over the workbook model.
- Use `sheetFromRows` and `rowsFromSheet` when your data is already shaped like JavaScript objects.
- Use `WorkbookBuilder` and `SheetBuilder` when you want a fluent API for construction.
- Use `WorkbookReader` and `SheetReader` when you want ergonomic read-only accessors over parsed workbooks.

## What the normalized model looks like

The public model is plain JavaScript objects:

```js
{
  sheets: [
    {
      name: "People",
      rows: [
        [
          { value: "name", formula: null, type: "string" },
          { value: "age", formula: null, type: "string" },
        ],
      ],
    },
  ],
}
```

That model is the shared contract across the reader, writer, builders, and tabular helpers.
