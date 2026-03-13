// Copyright © 2026 – present NapSoft LLC. All rights reserved.
import { describe, it, expect } from "vitest";
import { WorkbookBuilder } from "../../src/builder/workbook-builder.js";
import { SheetBuilder } from "../../src/builder/sheet-builder.js";
import { CellType } from "../../src/model/types.js";
import { writeXlsx } from "../../src/writer/index.js";
import { readXlsx } from "../../src/reader/index.js";

describe("WorkbookBuilder", () => {
  describe("create", () => {
    it("should return a WorkbookBuilder instance", () => {
      const wb = WorkbookBuilder.create();
      expect(wb).toBeInstanceOf(WorkbookBuilder);
    });
  });

  describe("sheet", () => {
    it("should create a SheetBuilder", () => {
      const wb = WorkbookBuilder.create();
      const sheet = wb.sheet("Sheet1");
      expect(sheet).toBeInstanceOf(SheetBuilder);
    });

    it("should return the same SheetBuilder for the same name", () => {
      const wb = WorkbookBuilder.create();
      const s1 = wb.sheet("Sheet1");
      const s2 = wb.sheet("Sheet1");
      expect(s1).toBe(s2);
    });

    it("should create different SheetBuilders for different names", () => {
      const wb = WorkbookBuilder.create();
      const s1 = wb.sheet("Sheet1");
      const s2 = wb.sheet("Sheet2");
      expect(s1).not.toBe(s2);
    });
  });

  describe("build", () => {
    it("should build an empty workbook", () => {
      const wb = WorkbookBuilder.create().build();
      expect(wb).toEqual({ sheets: [] });
    });

    it("should build a workbook with one sheet", () => {
      const builder = WorkbookBuilder.create();
      builder.sheet("Data").addRow(["hello", 42]);
      const wb = builder.build();

      expect(wb.sheets).toHaveLength(1);
      expect(wb.sheets[0].name).toBe("Data");
      expect(wb.sheets[0].rows).toHaveLength(1);
      expect(wb.sheets[0].rows[0][0].value).toBe("hello");
    });

    it("should build a workbook with multiple sheets in insertion order", () => {
      const builder = WorkbookBuilder.create();
      builder.sheet("First").addRow([1]);
      builder.sheet("Second").addRow([2]);
      builder.sheet("Third").addRow([3]);
      const wb = builder.build();

      expect(wb.sheets).toHaveLength(3);
      expect(wb.sheets[0].name).toBe("First");
      expect(wb.sheets[1].name).toBe("Second");
      expect(wb.sheets[2].name).toBe("Third");
    });
  });

  describe("round-trip", () => {
    it("should produce valid xlsx that can be read back", () => {
      const builder = WorkbookBuilder.create();
      const sheet = builder.sheet("Employees");
      sheet.addRow(["Name", "Age", "Active"]);
      sheet.addRow(["Alice", 30, true]);
      sheet.addRow(["Bob", 25, false]);

      const buffer = writeXlsx(builder.build());
      const wb = readXlsx(buffer);

      expect(wb.sheets).toHaveLength(1);
      expect(wb.sheets[0].name).toBe("Employees");
      expect(wb.sheets[0].rows).toHaveLength(3);
      expect(wb.sheets[0].rows[0][0].value).toBe("Name");
      expect(wb.sheets[0].rows[1][0].value).toBe("Alice");
      expect(wb.sheets[0].rows[1][1].value).toBe(30);
      expect(wb.sheets[0].rows[2][2].value).toBe(false);
    });

    it("should round-trip objects with addObjects", () => {
      const builder = WorkbookBuilder.create();
      builder.sheet("Data").addObjects([
        { text: "hello", vector: [0.1, 0.2, 0.3] },
        { text: "world", vector: [0.4, 0.5, 0.6] },
      ]);

      const buffer = writeXlsx(builder.build());
      const wb = readXlsx(buffer);

      expect(wb.sheets[0].rows).toHaveLength(3); // header + 2 data
      expect(wb.sheets[0].rows[0][0].value).toBe("text");
      expect(wb.sheets[0].rows[0][1].value).toBe("vector");
      expect(wb.sheets[0].rows[1][0].value).toBe("hello");
    });

    it("should round-trip dates", () => {
      const date = new Date("2024-01-15T00:00:00Z");
      const builder = WorkbookBuilder.create();
      builder.sheet("Dates").addRow(["Date"]).addRow([date]);

      const buffer = writeXlsx(builder.build());
      const wb = readXlsx(buffer);

      expect(wb.sheets[0].rows[1][0].type).toBe(CellType.DATE);
      expect(wb.sheets[0].rows[1][0].value.getTime()).toBe(date.getTime());
    });

    it("should round-trip multiple sheets", () => {
      const builder = WorkbookBuilder.create();
      builder.sheet("A").addRow([1]);
      builder.sheet("B").addRow([2]);

      const buffer = writeXlsx(builder.build());
      const wb = readXlsx(buffer);

      expect(wb.sheets).toHaveLength(2);
      expect(wb.sheets[0].name).toBe("A");
      expect(wb.sheets[1].name).toBe("B");
    });
  });
});
