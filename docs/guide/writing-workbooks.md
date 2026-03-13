# Writing Workbooks

Use `writeXlsx` when you want direct control over sheet names, cell values, and workbook layout.

## Build a workbook directly

```js
import {
  CellType,
  createCell,
  createWorkbook,
  createWorksheet,
  writeXlsx,
} from "tablsx";

const workbook = createWorkbook([
  createWorksheet("Metrics", [
    [createCell("label"), createCell("value"), createCell("updated_at")],
    [
      createCell("requests"),
      createCell(1250),
      createCell(new Date(), null, CellType.DATE),
    ],
  ]),
]);

const bytes = writeXlsx(workbook);
```

## Save to disk

```js
import { writeFile } from "node:fs/promises";

await writeFile("metrics.xlsx", bytes);
```

## Sheet name validation

`createWorkbook` and `writeXlsx` enforce Excel-compatible sheet names:

- no duplicates
- no names longer than 31 characters
- no `[]:*?/\\` characters

## Row normalization

Rows are normalized to the same width before writing. Shorter rows are padded with empty cells so the sheet remains rectangular.
