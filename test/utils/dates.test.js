// Copyright © 2026 – present NapSoft LLC. All rights reserved.
import { describe, it, expect } from "vitest";
import { excelDateToJS, jsDateToExcel } from "../../src/utils/dates.js";

describe("excelDateToJS", () => {
  it("converts serial 1 to 1900-01-01", () => {
    const d = excelDateToJS(1);
    expect(d.toISOString()).toBe("1900-01-01T00:00:00.000Z");
  });

  it("converts serial 59 to 1900-02-28", () => {
    const d = excelDateToJS(59);
    expect(d.toISOString()).toBe("1900-02-28T00:00:00.000Z");
  });

  it("converts serial 61 to 1900-03-01 (skipping phantom leap day)", () => {
    const d = excelDateToJS(61);
    expect(d.toISOString()).toBe("1900-03-01T00:00:00.000Z");
  });

  it("converts a modern date", () => {
    // 2024-01-01 = serial 45292
    const d = excelDateToJS(45292);
    expect(d.toISOString()).toBe("2024-01-01T00:00:00.000Z");
  });

  it("handles time-only values", () => {
    const d = excelDateToJS(0.5);
    expect(d.getUTCHours()).toBe(12);
    expect(d.getUTCMinutes()).toBe(0);
  });
});

describe("jsDateToExcel", () => {
  it("converts 1900-01-01 to serial 1", () => {
    const serial = jsDateToExcel(new Date(Date.UTC(1900, 0, 1)));
    expect(serial).toBe(1);
  });

  it("converts 1900-02-28 to serial 59", () => {
    const serial = jsDateToExcel(new Date(Date.UTC(1900, 1, 28)));
    expect(serial).toBe(59);
  });

  it("converts 1900-03-01 to serial 61", () => {
    const serial = jsDateToExcel(new Date(Date.UTC(1900, 2, 1)));
    expect(serial).toBe(61);
  });

  it("converts a modern date", () => {
    const serial = jsDateToExcel(new Date(Date.UTC(2024, 0, 1)));
    expect(serial).toBe(45292);
  });

  it("round-trips with excelDateToJS for modern dates", () => {
    const dates = [
      new Date(Date.UTC(2024, 0, 15)),
      new Date(Date.UTC(2023, 5, 30)),
      new Date(Date.UTC(2000, 0, 1)),
      new Date(Date.UTC(1999, 11, 31)),
    ];

    for (const date of dates) {
      const serial = jsDateToExcel(date);
      const roundTripped = excelDateToJS(serial);
      expect(roundTripped.toISOString()).toBe(date.toISOString());
    }
  });
});
