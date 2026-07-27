// Copyright © 2026 – present NapSoft LLC. All rights reserved.
import { CellType } from "../model/types.js";
import type { Worksheet } from "../model/types.js";
import { isVectorString } from "../utils/vectors.js";

/**
 * Inferred metadata for a single worksheet column.
 */
export interface SchemaColumn {
  name: string;
  type: CellType;
  nullable: boolean;
}

/**
 * Inferred schema for a worksheet.
 */
export interface Schema {
  columns: SchemaColumn[];
}

/**
 * Infer basic schema metadata from a worksheet.
 *
 * The first row is treated as headers. Remaining rows are scanned to determine
 * a dominant type per column and whether nulls are present.
 */
export function inferSchema(sheet: Worksheet): Schema {
  if (!sheet.rows || sheet.rows.length === 0) {
    return { columns: [] };
  }

  const headers = sheet.rows[0];
  if (!headers) {
    return { columns: [] };
  }
  const dataRows = sheet.rows.slice(1);

  const columns = headers.map((headerCell, colIndex): SchemaColumn => {
    const name = headerCell.value == null ? "" : String(headerCell.value);
    const typeCounts = new Map<CellType, number>();
    let hasEmpty = false;

    for (const row of dataRows) {
      const cell = row[colIndex];
      if (!cell || cell.type === CellType.EMPTY) {
        hasEmpty = true;
        continue;
      }

      if (
        cell.type === CellType.STRING &&
        typeof cell.value === "string" &&
        isVectorString(cell.value)
      ) {
        typeCounts.set(
          CellType.VECTOR,
          (typeCounts.get(CellType.VECTOR) ?? 0) + 1,
        );
      } else if (cell.type === CellType.VECTOR) {
        typeCounts.set(
          CellType.VECTOR,
          (typeCounts.get(CellType.VECTOR) ?? 0) + 1,
        );
      } else {
        typeCounts.set(cell.type, (typeCounts.get(cell.type) ?? 0) + 1);
      }
    }

    let dominantType: CellType = CellType.STRING;
    let maxCount = 0;
    for (const [type, count] of typeCounts) {
      if (count > maxCount) {
        maxCount = count;
        dominantType = type;
      }
    }

    return {
      name,
      type: dominantType,
      nullable: hasEmpty || dataRows.length === 0,
    };
  });

  return { columns };
}
