# Reading Workbooks

Use `readXlsx` when you already have workbook bytes in memory.

## Read from a buffer

```js
import { readFile } from "node:fs/promises";
import { readXlsx } from "tablsx";

const bytes = await readFile("report.xlsx");
const workbook = readXlsx(bytes);

console.log(workbook.sheets.map((sheet) => sheet.name));
```

## Use `WorkbookReader` for convenient access

```js
import { readFile } from "node:fs/promises";
import { WorkbookReader } from "tablsx";

const bytes = await readFile("report.xlsx");
const reader = WorkbookReader.fromBuffer(bytes);

const sheet = reader.sheet("Orders");
console.log(sheet.rowCount);
console.log(sheet.getCell(1, 0).value);
```

## Convert to objects

If the first row contains headers, `SheetReader#toObjects()` is the fastest path into application data:

```js
const rows = reader.sheet("Orders").toObjects();
```

If you need explicit typing for a column, pass overrides:

```js
import { CellType } from "tablsx";

const rows = reader.sheet("Embeddings").toObjects({
  columns: {
    embedding: { type: CellType.VECTOR },
    created_at: { type: CellType.DATE },
  },
});
```

## Error behavior

`readXlsx` throws when required package parts are missing or inconsistent. That is intentional. `tablsx` is designed to fail fast on malformed workbook structure instead of silently guessing.
