// Copyright © 2026 – present NapSoft LLC. All rights reserved.
import { CellType } from "../model/types.js";
import { isVectorString } from "../utils/vectors.js";

/**
 * Infer basic schema metadata from a worksheet.
 *
 * The first row is treated as headers. Remaining rows are scanned to determine
 * a dominant type per column and whether nulls are present.
 *
 * @param {import("../model/workbook.js").Worksheet} sheet
 * @returns {{ columns: Array<{ name: string, type: string, nullable: boolean }> }}
 */
export function inferSchema(sheet) {
  if (!sheet.rows || sheet.rows.length === 0) {
    return { columns: [] };
  }

  const headers = sheet.rows[0];
  const dataRows = sheet.rows.slice(1);

  const columns = headers.map((headerCell, colIndex) => {
    const name = headerCell.value == null ? "" : String(headerCell.value);
    const typeCounts = new Map();
    let hasEmpty = false;

    for (const row of dataRows) {
      const cell = row[colIndex];
      if (!cell || cell.type === CellType.EMPTY) {
        hasEmpty = true;
        continue;
      }

      if (cell.type === CellType.STRING && isVectorString(cell.value)) {
        typeCounts.set(
          CellType.VECTOR,
          (typeCounts.get(CellType.VECTOR) || 0) + 1,
        );
      } else if (cell.type === CellType.VECTOR) {
        typeCounts.set(
          CellType.VECTOR,
          (typeCounts.get(CellType.VECTOR) || 0) + 1,
        );
      } else {
        typeCounts.set(cell.type, (typeCounts.get(cell.type) || 0) + 1);
      }
    }

    let dominantType = CellType.STRING;
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
