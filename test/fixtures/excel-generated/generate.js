// Copyright © 2026 – present NapSoft LLC. All rights reserved.
/**
 * Generates .xlsx fixture files for compatibility testing.
 *
 * These files simulate workbooks that might be produced by external
 * applications (Excel, Google Sheets, LibreOffice). The reader tests
 * verify that readXlsx can correctly parse them, exercising the read
 * path independently of the write path.
 *
 * Usage: node test/fixtures/excel-generated/generate.js
 */
import { writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  writeXlsx,
  createWorkbook,
  createWorksheet,
  createCell,
  CellType,
} from "../../../src/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

function write(name, workbook) {
  const buffer = writeXlsx(workbook);
  writeFileSync(join(__dirname, name), buffer);
}

// --- basic-types.xlsx ---
// String, number, boolean, empty cells in a single sheet
write(
  "basic-types.xlsx",
  createWorkbook([
    createWorksheet("BasicTypes", [
      [
        createCell("Name"),
        createCell("Age"),
        createCell("Active"),
        createCell("Notes"),
      ],
      [createCell("Alice"), createCell(30), createCell(true), createCell("")],
      [
        createCell("Bob"),
        createCell(25),
        createCell(false),
        createCell(null, null, CellType.EMPTY),
      ],
      [
        createCell("<html>&amp;"),
        createCell(0),
        createCell(true),
        createCell('"quoted"'),
      ],
      [
        createCell("  leading/trailing  "),
        createCell(-99.99),
        createCell(false),
        createCell("line1\nline2"),
      ],
    ]),
  ]),
);

// --- dates.xlsx ---
// Various date values including edge cases
write(
  "dates.xlsx",
  createWorkbook([
    createWorksheet("Dates", [
      [createCell("Label"), createCell("Date")],
      [createCell("Modern date"), createCell(new Date("2024-06-15T00:00:00Z"))],
      [createCell("Date+time"), createCell(new Date("2024-01-15T14:30:45Z"))],
      [createCell("Y2K"), createCell(new Date("2000-01-01T00:00:00Z"))],
      [createCell("Midnight"), createCell(new Date("2023-07-04T00:00:00Z"))],
      [
        createCell("Pre-1900 boundary"),
        createCell(new Date(Date.UTC(1900, 1, 28))),
      ],
      [
        createCell("Post-1900 boundary"),
        createCell(new Date(Date.UTC(1900, 2, 1))),
      ],
      [createCell("Excel epoch"), createCell(new Date(Date.UTC(1900, 0, 1)))],
      [createCell("Far future"), createCell(new Date(Date.UTC(2099, 11, 31)))],
    ]),
  ]),
);

// --- formulas.xlsx ---
// Cells with formulas and cached values
write(
  "formulas.xlsx",
  createWorkbook([
    createWorksheet("Formulas", [
      [createCell("A"), createCell("B"), createCell("Sum")],
      [createCell(10), createCell(20), createCell(30, "SUM(A2:B2)")],
      [createCell(5), createCell(15), createCell(20, "SUM(A3:B3)")],
      [
        createCell("hello"),
        createCell(" world"),
        createCell("hello world", "CONCATENATE(A4,B4)"),
      ],
      [
        createCell(null, null, CellType.EMPTY),
        createCell(null, null, CellType.EMPTY),
        createCell(null, "NOW()", CellType.FORMULA),
      ],
    ]),
  ]),
);

// --- multi-sheet.xlsx ---
// Multiple worksheets with different content
write(
  "multi-sheet.xlsx",
  createWorkbook([
    createWorksheet("Employees", [
      [createCell("Name"), createCell("Department")],
      [createCell("Alice"), createCell("Engineering")],
      [createCell("Bob"), createCell("Design")],
    ]),
    createWorksheet("Numbers", [
      [createCell(1), createCell(2), createCell(3)],
      [createCell(4), createCell(5), createCell(6)],
    ]),
    createWorksheet("Empty", []),
    createWorksheet("SingleCell", [[createCell("only")]]),
  ]),
);

// --- large-dataset.xlsx ---
// 10,000 rows × 10 columns with mixed types
const largeRows = [
  Array.from({ length: 10 }, (_, i) => createCell(`Header${i}`)),
];
for (let r = 0; r < 10000; r++) {
  largeRows.push([
    createCell(r),
    createCell(`row-${r}`),
    createCell(r * 1.1),
    createCell(r % 2 === 0),
    createCell(new Date(Date.UTC(2020, 0, 1 + (r % 365)))),
    createCell(`data-${r}-A`),
    createCell(r * 100),
    createCell(r % 3 === 0),
    createCell(`data-${r}-B`),
    createCell(r + 0.5),
  ]);
}
write(
  "large-dataset.xlsx",
  createWorkbook([createWorksheet("LargeData", largeRows)]),
);

/* eslint-disable no-undef, no-console */
console.log("Generated 5 fixture files in test/fixtures/excel-generated/");
