# Builder API

Use the builders when you want a fluent construction API but still want the plain normalized workbook model as output.

## WorkbookBuilder

```js
import { WorkbookBuilder, writeXlsx } from "tablsx";

const builder = WorkbookBuilder.create();

builder
  .sheet("Summary")
  .setHeaders(["metric", "value"])
  .addRow(["users", 42])
  .addRow(["jobs", 8]);

const workbook = builder.build();

const bytes = writeXlsx(workbook);
```

For multi-sheet workbooks, keep a reference to the root builder:

```js
import { WorkbookBuilder } from "tablsx";

const builder = WorkbookBuilder.create();

builder.sheet("Users").addObjects([
  { id: 1, name: "Ada" },
  { id: 2, name: "Linus" },
]);

builder.sheet("Audit").addRow(["generated_at", new Date()]);

const workbook = builder.build();
```

## SheetBuilder

`SheetBuilder` supports three input styles:

- `setHeaders()` plus `addRow()` for positional data
- `addRows()` for batches of positional data
- `addObjects()` for row objects and type overrides

The resulting sheet is the same shape you would build manually with `createWorksheet`.
