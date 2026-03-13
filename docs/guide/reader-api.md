# Reader API

Use the reader classes when you want convenient, read-only access to a
normalized workbook without manually indexing into plain objects.

## WorkbookReader

`WorkbookReader` wraps a workbook and provides sheet lookup helpers.

```js
import { WorkbookReader } from "tablsx";

const reader = WorkbookReader.fromBuffer(bytes);

console.log(reader.sheetNames);
console.log(reader.sheetCount);

const summary = reader.sheet("Summary");
const firstSheet = reader.sheet(0);
```

Use `WorkbookReader` when you want:

- `sheet(name)` or `sheet(index)` access
- `sheetNames` and `sheetCount`
- a thin read-oriented wrapper over parsed data

If you only need the raw normalized model, `readXlsx()` is the simpler choice.

## SheetReader

`SheetReader` wraps one worksheet and provides convenience accessors for rows,
cells, raw values, and row-object conversion.

```js
import { WorkbookReader } from "tablsx";

const reader = WorkbookReader.fromBuffer(bytes);
const sheet = reader.sheet("Users");

console.log(sheet.name);
console.log(sheet.rowCount);
console.log(sheet.columnCount);

const headerRow = sheet.getRow(0);
const firstNameCell = sheet.getCell(1, 0);
const values = sheet.toValues();
```

## Converting a sheet to row objects

Use `toObjects()` when the first row is a header row and you want plain objects
back.

```js
import { WorkbookReader } from "tablsx";

const sheet = WorkbookReader.fromBuffer(bytes).sheet("Users");

const rows = sheet.toObjects();
```

You can also provide explicit headers or column type overrides:

```js
import { CellType, WorkbookReader } from "tablsx";

const sheet = WorkbookReader.fromBuffer(bytes).sheet("Embeddings");

const rows = sheet.toObjects({
  columns: {
    embedding: { type: CellType.VECTOR },
    created_at: { type: CellType.DATE },
  },
});
```

## When to use readers instead of plain functions

Use `readXlsx()` directly when:

- you want the smallest API surface
- your code already works well with plain workbook objects
- you only need one or two direct property reads

Use `WorkbookReader` and `SheetReader` when:

- you want name-based sheet access
- you expect repeated row and cell lookups
- you want `toValues()` or `toObjects()` helpers close to the sheet
- you want a more guided read path for application code

## Relationship to the normalized model

Readers do not replace the normalized workbook shape. They wrap it.

This means you can move between both styles freely:

```js
import { WorkbookReader, readXlsx } from "tablsx";

const workbook = readXlsx(bytes);
const reader = WorkbookReader.fromWorkbook(workbook);

const users = reader.sheet("Users").toObjects();
```

If your application eventually needs the plain workbook object for storage,
diffing, or testing, readers do not get in the way.
