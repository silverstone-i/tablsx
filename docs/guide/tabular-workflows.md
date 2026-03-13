# Tabular Workflows

Use the tabular helpers when your application data is already shaped like JavaScript row objects.

## Objects to worksheet

```js
import { sheetFromRows } from "tablsx";

const sheet = sheetFromRows(
  [
    { id: 1, name: "Ada", active: true },
    { id: 2, name: "Linus", active: false },
  ],
  { name: "Users" },
);
```

The generated worksheet includes a header row derived from the union of keys across all objects.

## Worksheet to objects

```js
import { rowsFromSheet } from "tablsx";

const objects = rowsFromSheet(sheet);
```

## Column overrides

Overrides are useful when a source column should be treated as a specific logical type:

```js
import { CellType, sheetFromRows } from "tablsx";

const sheet = sheetFromRows(
  [{ embedding: [0.1, 0.2, 0.3], created_at: "2026-03-12" }],
  {
    columns: {
      embedding: { type: CellType.VECTOR },
      created_at: { type: CellType.DATE },
    },
  },
);
```

## Schema inference

```js
import { inferSchema } from "tablsx";

const schema = inferSchema(sheet);
```

`inferSchema` reports column names, dominant types, and whether nulls are present. It is useful for import previews or downstream validation steps.
