// Copyright © 2026 – present NapSoft LLC. All rights reserved.
import { describe, it, expect } from "vitest";
import { CellType, inferType, isCellType } from "../../src/model/types.js";

describe("CellType", () => {
  it("has expected values", () => {
    expect(CellType.STRING).toBe("string");
    expect(CellType.NUMBER).toBe("number");
    expect(CellType.BOOLEAN).toBe("boolean");
    expect(CellType.DATE).toBe("date");
    expect(CellType.EMPTY).toBe("empty");
    expect(CellType.FORMULA).toBe("formula");
    expect(CellType.VECTOR).toBe("vector");
  });
});

describe("inferType", () => {
  it("infers empty for null/undefined", () => {
    expect(inferType(null)).toBe("empty");
    expect(inferType(undefined)).toBe("empty");
  });

  it("infers string", () => {
    expect(inferType("hello")).toBe("string");
    expect(inferType("")).toBe("string");
  });

  it("infers number", () => {
    expect(inferType(42)).toBe("number");
    expect(inferType(0)).toBe("number");
    expect(inferType(3.14)).toBe("number");
  });

  it("infers boolean", () => {
    expect(inferType(true)).toBe("boolean");
    expect(inferType(false)).toBe("boolean");
  });

  it("infers date", () => {
    expect(inferType(new Date())).toBe("date");
  });

  it("infers vector for number arrays", () => {
    expect(inferType([1, 2, 3])).toBe("vector");
    expect(inferType([0.1, 0.2])).toBe("vector");
  });

  it("falls back to string for non-number arrays", () => {
    expect(inferType(["a", "b"])).toBe("string");
    expect(inferType([1, "a"])).toBe("string");
  });
});

describe("isCellType", () => {
  it("validates known types", () => {
    expect(isCellType("string")).toBe(true);
    expect(isCellType("number")).toBe(true);
    expect(isCellType("boolean")).toBe(true);
    expect(isCellType("empty")).toBe(true);
  });

  it("rejects unknown types", () => {
    expect(isCellType("unknown")).toBe(false);
    expect(isCellType("")).toBe(false);
  });
});
