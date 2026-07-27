// Copyright © 2026 – present NapSoft LLC. All rights reserved.
import { describe, it, expect } from "vitest";
import {
  readXlsx,
  writeXlsx,
  createWorkbook,
  createWorksheet,
  createCell,
  CellType,
  deserializeVector,
} from "../../../src/index.js";

describe("synthetic fixture — all types round-trip", () => {
  /**
   * Build a workbook containing every supported cell type and verify
   * complete round-trip fidelity: write → read → compare.
   */
  it("round-trips a comprehensive multi-sheet workbook with all types", () => {
    const date1 = new Date("2024-01-15T10:30:00Z");
    const date2 = new Date("1999-12-31T23:59:59Z");
    const date3 = new Date(Date.UTC(1900, 1, 28)); // 1900 bug boundary
    const date4 = new Date(Date.UTC(1900, 2, 1)); // after phantom leap day
    const vec1 = [0.1, 0.2, 0.3, 0.4, 0.5];
    const vec2 = [-1e-10, 0, 1e10];

    const wb = createWorkbook([
      createWorksheet("Strings", [
        [createCell("Header A"), createCell("Header B")],
        [createCell("simple"), createCell("")],
        [createCell("<html>&amp;"), createCell('"quotes"')],
      ]),
      createWorksheet("Numbers", [
        [createCell(0), createCell(1), createCell(-1)],
        [createCell(3.14159265358979), createCell(1e20), createCell(1e-15)],
        [
          createCell(Number.MAX_SAFE_INTEGER),
          createCell(Number.MIN_SAFE_INTEGER),
          createCell(0.1 + 0.2),
        ],
      ]),
      createWorksheet("Booleans", [[createCell(true), createCell(false)]]),
      createWorksheet("Dates", [
        [createCell(date1), createCell(date2)],
        [createCell(date3), createCell(date4)],
      ]),
      createWorksheet("Formulas", [
        [createCell(10), createCell(20), createCell(30, "SUM(A1:B1)")],
        [createCell("abc", 'CONCATENATE("a","b","c")')],
        [createCell(null, "NOW()", CellType.FORMULA)],
      ]),
      createWorksheet("Vectors", [[createCell(vec1), createCell(vec2)]]),
      createWorksheet("Empty", []),
    ]);

    const buffer = writeXlsx(wb);
    const result = readXlsx(buffer);

    // Sheet count
    expect(result.sheets.length).toBe(7);

    // Strings
    const strings = result.sheets[0];
    expect(strings.name).toBe("Strings");
    expect(strings.rows[0][0].value).toBe("Header A");
    expect(strings.rows[1][0].value).toBe("simple");
    expect(strings.rows[1][1].value).toBe("");
    expect(strings.rows[2][0].value).toBe("<html>&amp;");
    expect(strings.rows[2][1].value).toBe('"quotes"');

    // Numbers
    const numbers = result.sheets[1];
    expect(numbers.rows[0][0].value).toBe(0);
    expect(numbers.rows[0][1].value).toBe(1);
    expect(numbers.rows[0][2].value).toBe(-1);
    expect(numbers.rows[1][0].value).toBeCloseTo(3.14159265358979, 10);
    expect(numbers.rows[2][0].value).toBe(Number.MAX_SAFE_INTEGER);
    expect(numbers.rows[2][1].value).toBe(Number.MIN_SAFE_INTEGER);

    // Booleans
    const booleans = result.sheets[2];
    expect(booleans.rows[0][0].value).toBe(true);
    expect(booleans.rows[0][0].type).toBe(CellType.BOOLEAN);
    expect(booleans.rows[0][1].value).toBe(false);

    // Dates
    const dates = result.sheets[3];
    expect(dates.rows[0][0].type).toBe(CellType.DATE);
    expect(dates.rows[0][0].value.getUTCFullYear()).toBe(2024);
    expect(dates.rows[0][0].value.getUTCHours()).toBe(10);
    expect(dates.rows[0][0].value.getUTCMinutes()).toBe(30);
    expect(dates.rows[0][1].value.toISOString()).toBe(
      "1999-12-31T23:59:59.000Z",
    );
    expect(dates.rows[1][0].value.toISOString()).toBe(
      "1900-02-28T00:00:00.000Z",
    );
    expect(dates.rows[1][1].value.toISOString()).toBe(
      "1900-03-01T00:00:00.000Z",
    );

    // Formulas
    const formulas = result.sheets[4];
    expect(formulas.rows[0][2].type).toBe(CellType.FORMULA);
    expect(formulas.rows[0][2].formula).toBe("SUM(A1:B1)");
    expect(formulas.rows[0][2].value).toBe(30);
    expect(formulas.rows[1][0].type).toBe(CellType.FORMULA);
    expect(formulas.rows[1][0].formula).toBe('CONCATENATE("a","b","c")');
    expect(formulas.rows[1][0].value).toBe("abc");
    expect(formulas.rows[2][0].type).toBe(CellType.FORMULA);
    expect(formulas.rows[2][0].formula).toBe("NOW()");

    // Vectors (read back as strings, verify JSON parse)
    const vectors = result.sheets[5];
    expect(vectors.rows[0][0].type).toBe(CellType.STRING);
    expect(deserializeVector(vectors.rows[0][0].value)).toEqual(vec1);
    expect(deserializeVector(vectors.rows[0][1].value)).toEqual(vec2);

    // Empty sheet
    expect(result.sheets[6].name).toBe("Empty");
    expect(result.sheets[6].rows).toEqual([]);
  });
});
