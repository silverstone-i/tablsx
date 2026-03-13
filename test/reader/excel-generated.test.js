// Copyright © 2026 – present NapSoft LLC. All rights reserved.
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { readXlsx, CellType } from "../../src/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixtureDir = join(__dirname, "../fixtures/excel-generated");

function readFixture(name) {
  const buffer = readFileSync(join(fixtureDir, name));
  return readXlsx(buffer);
}

describe("excel-generated compatibility — basic-types.xlsx", () => {
  let wb;

  it("reads without errors", () => {
    wb = readFixture("basic-types.xlsx");
    expect(wb.sheets).toHaveLength(1);
    expect(wb.sheets[0].name).toBe("BasicTypes");
  });

  it("reads string cells", () => {
    wb = readFixture("basic-types.xlsx");
    expect(wb.sheets[0].rows[0][0].value).toBe("Name");
    expect(wb.sheets[0].rows[0][0].type).toBe(CellType.STRING);
    expect(wb.sheets[0].rows[1][0].value).toBe("Alice");
    expect(wb.sheets[0].rows[2][0].value).toBe("Bob");
  });

  it("reads number cells", () => {
    wb = readFixture("basic-types.xlsx");
    expect(wb.sheets[0].rows[1][1].value).toBe(30);
    expect(wb.sheets[0].rows[1][1].type).toBe(CellType.NUMBER);
    expect(wb.sheets[0].rows[2][1].value).toBe(25);
    expect(wb.sheets[0].rows[3][1].value).toBe(0);
    expect(wb.sheets[0].rows[4][1].value).toBe(-99.99);
  });

  it("reads boolean cells", () => {
    wb = readFixture("basic-types.xlsx");
    expect(wb.sheets[0].rows[1][2].value).toBe(true);
    expect(wb.sheets[0].rows[1][2].type).toBe(CellType.BOOLEAN);
    expect(wb.sheets[0].rows[2][2].value).toBe(false);
    expect(wb.sheets[0].rows[2][2].type).toBe(CellType.BOOLEAN);
  });

  it("reads empty cells", () => {
    wb = readFixture("basic-types.xlsx");
    expect(wb.sheets[0].rows[2][3].type).toBe(CellType.EMPTY);
    expect(wb.sheets[0].rows[2][3].value).toBe(null);
  });

  it("reads XML special characters in strings", () => {
    wb = readFixture("basic-types.xlsx");
    expect(wb.sheets[0].rows[3][0].value).toBe("<html>&amp;");
    expect(wb.sheets[0].rows[3][3].value).toBe('"quoted"');
  });

  it("reads whitespace-sensitive strings", () => {
    wb = readFixture("basic-types.xlsx");
    expect(wb.sheets[0].rows[4][0].value).toBe("  leading/trailing  ");
  });

  it("reads strings with newlines", () => {
    wb = readFixture("basic-types.xlsx");
    expect(wb.sheets[0].rows[4][3].value).toBe("line1\nline2");
  });
});

describe("excel-generated compatibility — dates.xlsx", () => {
  let wb;

  it("reads without errors", () => {
    wb = readFixture("dates.xlsx");
    expect(wb.sheets).toHaveLength(1);
    expect(wb.sheets[0].name).toBe("Dates");
  });

  it("reads modern date values", () => {
    wb = readFixture("dates.xlsx");
    const cell = wb.sheets[0].rows[1][1];
    expect(cell.type).toBe(CellType.DATE);
    expect(cell.value.toISOString()).toBe("2024-06-15T00:00:00.000Z");
  });

  it("reads date+time values", () => {
    wb = readFixture("dates.xlsx");
    const cell = wb.sheets[0].rows[2][1];
    expect(cell.type).toBe(CellType.DATE);
    expect(cell.value.getUTCFullYear()).toBe(2024);
    expect(cell.value.getUTCHours()).toBe(14);
    expect(cell.value.getUTCMinutes()).toBe(30);
    expect(cell.value.getUTCSeconds()).toBe(45);
  });

  it("reads Y2K date", () => {
    wb = readFixture("dates.xlsx");
    expect(wb.sheets[0].rows[3][1].value.toISOString()).toBe(
      "2000-01-01T00:00:00.000Z",
    );
  });

  it("reads dates near the 1900 leap year bug boundary", () => {
    wb = readFixture("dates.xlsx");
    // Pre-boundary: 1900-02-28
    expect(wb.sheets[0].rows[5][1].value.toISOString()).toBe(
      "1900-02-28T00:00:00.000Z",
    );
    // Post-boundary: 1900-03-01
    expect(wb.sheets[0].rows[6][1].value.toISOString()).toBe(
      "1900-03-01T00:00:00.000Z",
    );
  });

  it("reads Excel epoch date", () => {
    wb = readFixture("dates.xlsx");
    expect(wb.sheets[0].rows[7][1].value.toISOString()).toBe(
      "1900-01-01T00:00:00.000Z",
    );
  });

  it("reads far future date", () => {
    wb = readFixture("dates.xlsx");
    expect(wb.sheets[0].rows[8][1].value.toISOString()).toBe(
      "2099-12-31T00:00:00.000Z",
    );
  });
});

describe("excel-generated compatibility — formulas.xlsx", () => {
  let wb;

  it("reads without errors", () => {
    wb = readFixture("formulas.xlsx");
    expect(wb.sheets).toHaveLength(1);
    expect(wb.sheets[0].name).toBe("Formulas");
  });

  it("reads formula cells with numeric cached values", () => {
    wb = readFixture("formulas.xlsx");
    const cell = wb.sheets[0].rows[1][2];
    expect(cell.type).toBe(CellType.FORMULA);
    expect(cell.formula).toBe("SUM(A2:B2)");
    expect(cell.value).toBe(30);
  });

  it("reads formula cells with string cached values", () => {
    wb = readFixture("formulas.xlsx");
    const cell = wb.sheets[0].rows[3][2];
    expect(cell.type).toBe(CellType.FORMULA);
    expect(cell.formula).toBe("CONCATENATE(A4,B4)");
    expect(cell.value).toBe("hello world");
  });

  it("reads formula cells with no cached value", () => {
    wb = readFixture("formulas.xlsx");
    const cell = wb.sheets[0].rows[4][2];
    expect(cell.type).toBe(CellType.FORMULA);
    expect(cell.formula).toBe("NOW()");
  });

  it("reads non-formula cells alongside formulas", () => {
    wb = readFixture("formulas.xlsx");
    expect(wb.sheets[0].rows[1][0].value).toBe(10);
    expect(wb.sheets[0].rows[1][0].type).toBe(CellType.NUMBER);
    expect(wb.sheets[0].rows[1][1].value).toBe(20);
  });
});

describe("excel-generated compatibility — multi-sheet.xlsx", () => {
  let wb;

  it("reads without errors", () => {
    wb = readFixture("multi-sheet.xlsx");
    expect(wb.sheets).toHaveLength(4);
  });

  it("preserves sheet names and order", () => {
    wb = readFixture("multi-sheet.xlsx");
    expect(wb.sheets[0].name).toBe("Employees");
    expect(wb.sheets[1].name).toBe("Numbers");
    expect(wb.sheets[2].name).toBe("Empty");
    expect(wb.sheets[3].name).toBe("SingleCell");
  });

  it("reads first sheet content", () => {
    wb = readFixture("multi-sheet.xlsx");
    expect(wb.sheets[0].rows[0][0].value).toBe("Name");
    expect(wb.sheets[0].rows[1][0].value).toBe("Alice");
    expect(wb.sheets[0].rows[1][1].value).toBe("Engineering");
    expect(wb.sheets[0].rows[2][0].value).toBe("Bob");
  });

  it("reads numeric sheet content", () => {
    wb = readFixture("multi-sheet.xlsx");
    expect(wb.sheets[1].rows[0][0].value).toBe(1);
    expect(wb.sheets[1].rows[0][2].value).toBe(3);
    expect(wb.sheets[1].rows[1][0].value).toBe(4);
    expect(wb.sheets[1].rows[1][2].value).toBe(6);
  });

  it("reads empty sheet", () => {
    wb = readFixture("multi-sheet.xlsx");
    expect(wb.sheets[2].rows).toEqual([]);
  });

  it("reads single-cell sheet", () => {
    wb = readFixture("multi-sheet.xlsx");
    expect(wb.sheets[3].rows).toHaveLength(1);
    expect(wb.sheets[3].rows[0]).toHaveLength(1);
    expect(wb.sheets[3].rows[0][0].value).toBe("only");
  });
});

describe("excel-generated compatibility — large-dataset.xlsx", () => {
  let wb;

  it("reads without errors", () => {
    wb = readFixture("large-dataset.xlsx");
    expect(wb.sheets).toHaveLength(1);
    expect(wb.sheets[0].name).toBe("LargeData");
  });

  it("has correct row count (header + 10,000 data rows)", () => {
    wb = readFixture("large-dataset.xlsx");
    expect(wb.sheets[0].rows).toHaveLength(10001);
  });

  it("reads header row", () => {
    wb = readFixture("large-dataset.xlsx");
    expect(wb.sheets[0].rows[0][0].value).toBe("Header0");
    expect(wb.sheets[0].rows[0][9].value).toBe("Header9");
  });

  it("reads first data row correctly", () => {
    wb = readFixture("large-dataset.xlsx");
    const row = wb.sheets[0].rows[1];
    expect(row[0].value).toBe(0);
    expect(row[0].type).toBe(CellType.NUMBER);
    expect(row[1].value).toBe("row-0");
    expect(row[1].type).toBe(CellType.STRING);
    expect(row[2].value).toBeCloseTo(0);
    expect(row[3].value).toBe(true);
    expect(row[3].type).toBe(CellType.BOOLEAN);
    expect(row[4].type).toBe(CellType.DATE);
    expect(row[4].value.toISOString()).toBe("2020-01-01T00:00:00.000Z");
  });

  it("reads last data row correctly", () => {
    wb = readFixture("large-dataset.xlsx");
    const row = wb.sheets[0].rows[10000];
    expect(row[0].value).toBe(9999);
    expect(row[1].value).toBe("row-9999");
    expect(row[2].value).toBeCloseTo(9999 * 1.1);
    expect(row[3].value).toBe(9999 % 2 === 0);
  });

  it("reads a sampled middle row correctly", () => {
    wb = readFixture("large-dataset.xlsx");
    const r = 5000;
    const row = wb.sheets[0].rows[r + 1]; // +1 for header
    expect(row[0].value).toBe(r);
    expect(row[1].value).toBe(`row-${r}`);
    expect(row[3].value).toBe(r % 2 === 0);
    expect(row[7].value).toBe(r % 3 === 0);
  });

  it("has correct column count", () => {
    wb = readFixture("large-dataset.xlsx");
    expect(wb.sheets[0].rows[0]).toHaveLength(10);
    expect(wb.sheets[0].rows[1]).toHaveLength(10);
    expect(wb.sheets[0].rows[10000]).toHaveLength(10);
  });
});
