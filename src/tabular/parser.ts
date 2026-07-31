// Copyright © 2026 – present NapSoft LLC. All rights reserved.
import { CellType } from "../model/types.js";
import type { Cell, CellValue, Worksheet } from "../model/types.js";
import { isVectorString, deserializeVector } from "../utils/vectors.js";
import { excelDateToJS } from "../utils/dates.js";

/**
 * A worksheet row converted to a plain object keyed by header name.
 */
export type RowObject = Record<string, CellValue>;

/**
 * A per-column type override.
 */
export interface ColumnOverride {
  type: CellType;
}

/**
 * Column type overrides keyed by header name.
 */
export type ColumnTypeOverrides = Record<string, ColumnOverride>;

/**
 * Options for {@link rowsFromSheet}.
 */
export interface RowsFromSheetOptions {
  columns?: ColumnTypeOverrides;
}

/**
 * Convert a worksheet into an array of plain objects.
 *
 * The first row is treated as headers. Duplicate header names are
 * disambiguated with `_2`, `_3`, and so on.
 */
export function rowsFromSheet(
  sheet: Worksheet,
  options: RowsFromSheetOptions = {},
): RowObject[] {
  if (!sheet.rows || sheet.rows.length <= 1) {
    return [];
  }

  const headerRow = sheet.rows[0];
  if (!headerRow) return [];

  const rawHeaders = headerRow.map((cell) =>
    cell.value == null ? "" : String(cell.value),
  );

  // Disambiguate duplicate header names by appending _2, _3, etc.
  const seen = new Map<string, number>();
  const headers = rawHeaders.map((name) => {
    const count = seen.get(name) ?? 0;
    seen.set(name, count + 1);
    return count === 0 ? name : `${name}_${count + 1}`;
  });

  const columnOverrides = options.columns ?? {};
  const dataRows = sheet.rows.slice(1);

  return dataRows.map((row) => {
    const obj: RowObject = {};
    for (let i = 0; i < headers.length; i++) {
      const key = headers[i];
      if (key === undefined) continue;
      const cell = row[i];

      if (!cell || cell.type === CellType.EMPTY) {
        obj[key] = null;
        continue;
      }

      const override = columnOverrides[key];
      if (override) {
        obj[key] = resolveWithOverride(cell, override.type);
        continue;
      }

      obj[key] = cell.value;
    }
    return obj;
  });
}

/**
 * Resolve a cell value with a column type override applied.
 */
function resolveWithOverride(cell: Cell, overrideType: CellType): CellValue {
  switch (overrideType) {
    case CellType.VECTOR: {
      if (cell.type === CellType.VECTOR) {
        return cell.value;
      }
      if (
        cell.type === CellType.STRING &&
        typeof cell.value === "string" &&
        isVectorString(cell.value)
      ) {
        return deserializeVector(cell.value);
      }
      return cell.value;
    }
    case CellType.DATE: {
      if (cell.type === CellType.DATE) {
        return cell.value;
      }
      if (cell.type === CellType.NUMBER && typeof cell.value === "number") {
        return excelDateToJS(cell.value);
      }
      return cell.value;
    }
    default:
      return cell.value;
  }
}
