// Copyright © 2026 – present NapSoft LLC. All rights reserved.
import { describe, it, expect } from "vitest";
import {
  readXlsx,
  writeXlsx,
  createWorkbook,
  createWorksheet,
  createCell,
  CellType,
} from "../../src/index.js";

describe("performance", () => {
  it("handles 100k rows x 20 columns with mixed types", () => {
    const ROW_COUNT = 100_000;
    const COL_COUNT = 20;

    // Build rows with mixed types
    const rows = [];
    for (let r = 0; r < ROW_COUNT; r++) {
      const row = [];
      for (let c = 0; c < COL_COUNT; c++) {
        const mod = c % 5;
        if (mod === 0) row.push(createCell(null, null, CellType.EMPTY));
        else if (mod === 1) row.push(createCell(`str-${r}-${c}`));
        else if (mod === 2) row.push(createCell(r * COL_COUNT + c));
        else if (mod === 3) row.push(createCell(r % 2 === 0));
        else row.push(createCell(new Date(Date.UTC(2020, 0, 1 + (r % 365)))));
      }
      rows.push(row);
    }

    const wb = createWorkbook([createWorksheet("Large", rows)]);

    // Write
    const writeStart = globalThis.performance.now();
    const buffer = writeXlsx(wb);
    const writeMs = globalThis.performance.now() - writeStart;

    expect(buffer).toBeInstanceOf(Uint8Array);
    expect(buffer.length).toBeGreaterThan(0);

    // Read
    const readStart = globalThis.performance.now();
    const result = readXlsx(buffer);
    const readMs = globalThis.performance.now() - readStart;

    // Verify structure
    expect(result.sheets.length).toBe(1);
    expect(result.sheets[0].rows.length).toBe(ROW_COUNT);
    expect(result.sheets[0].rows[0].length).toBe(COL_COUNT);

    // Spot-check first row (mod 0=empty, 1=string, 2=number, 3=boolean, 4=date)
    expect(result.sheets[0].rows[0][0].type).toBe(CellType.EMPTY);
    expect(result.sheets[0].rows[0][1].value).toBe("str-0-1");
    expect(result.sheets[0].rows[0][1].type).toBe(CellType.STRING);
    expect(result.sheets[0].rows[0][2].value).toBe(2);
    expect(result.sheets[0].rows[0][2].type).toBe(CellType.NUMBER);
    expect(result.sheets[0].rows[0][3].value).toBe(true);
    expect(result.sheets[0].rows[0][3].type).toBe(CellType.BOOLEAN);
    expect(result.sheets[0].rows[0][4].type).toBe(CellType.DATE);

    // Spot-check last row
    const lastRow = result.sheets[0].rows[ROW_COUNT - 1];
    expect(lastRow[1].value).toBe(`str-${ROW_COUNT - 1}-1`);

    // Spot-check middle row
    const midIdx = Math.floor(ROW_COUNT / 2);
    const midRow = result.sheets[0].rows[midIdx];
    expect(midRow[1].value).toBe(`str-${midIdx}-1`);

    // Log timing (informational, not a strict gate)
    /* eslint-disable-next-line no-undef, no-console */
    console.log(
      `Performance: write=${writeMs.toFixed(0)}ms, read=${readMs.toFixed(0)}ms, size=${(buffer.length / 1024 / 1024).toFixed(1)}MB`,
    );
  }, 30_000); // 30s timeout
});
