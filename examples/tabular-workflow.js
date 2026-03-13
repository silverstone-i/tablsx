// Copyright © 2026 – present NapSoft LLC. All rights reserved.
import {
  CellType,
  inferSchema,
  rowsFromSheet,
  sheetFromRows,
} from "../src/index.js";

export function createEmbeddingsSheet() {
  return sheetFromRows(
    [
      {
        id: 1,
        label: "Ada",
        embedding: [0.1, 0.2, 0.3],
        created_at: "2026-03-12",
      },
      {
        id: 2,
        label: "Linus",
        embedding: [0.4, 0.5, 0.6],
        created_at: "2026-03-13",
      },
    ],
    {
      name: "Embeddings",
      columns: {
        embedding: { type: CellType.VECTOR },
        created_at: { type: CellType.DATE },
      },
    },
  );
}

export function parseEmbeddingsSheet() {
  const sheet = createEmbeddingsSheet();
  return rowsFromSheet(sheet, {
    columns: {
      embedding: { type: CellType.VECTOR },
      created_at: { type: CellType.DATE },
    },
  });
}

export function inferEmbeddingsSchema() {
  return inferSchema(createEmbeddingsSheet());
}
