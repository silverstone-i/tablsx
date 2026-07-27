// Copyright © 2026 – present NapSoft LLC. All rights reserved.
import { describe, it, expect } from "vitest";
import {
  serializeVector,
  deserializeVector,
  isVectorString,
} from "../../src/utils/vectors.js";

describe("serializeVector", () => {
  it("serializes a number array to JSON", () => {
    expect(serializeVector([1, 2, 3])).toBe("[1,2,3]");
  });

  it("handles floating-point numbers", () => {
    expect(serializeVector([0.1, 0.2, 0.3])).toBe("[0.1,0.2,0.3]");
  });

  it("handles empty arrays", () => {
    expect(serializeVector([])).toBe("[]");
  });

  it("throws on NaN or Infinity values", () => {
    expect(() => serializeVector([NaN, 1])).toThrow("finite numbers");
    expect(() => serializeVector([Infinity])).toThrow("finite numbers");
    expect(() => serializeVector([-Infinity])).toThrow("finite numbers");
  });

  it("throws on non-array input", () => {
    expect(() => serializeVector("not an array")).toThrow("finite numbers");
  });
});

describe("deserializeVector", () => {
  it("deserializes a JSON string to number array", () => {
    expect(deserializeVector("[1,2,3]")).toEqual([1, 2, 3]);
  });

  it("handles floating-point numbers", () => {
    expect(deserializeVector("[0.1,0.2,0.3]")).toEqual([0.1, 0.2, 0.3]);
  });

  it("throws on non-array input", () => {
    expect(() => deserializeVector("42")).toThrow();
    expect(() => deserializeVector('"hello"')).toThrow();
  });

  it("throws on arrays with non-numbers", () => {
    expect(() => deserializeVector('["a","b"]')).toThrow();
  });

  it("round-trips with serializeVector", () => {
    const vectors = [[1, 2, 3], [0.1, 0.2], [], [42]];
    for (const vec of vectors) {
      expect(deserializeVector(serializeVector(vec))).toEqual(vec);
    }
  });
});

describe("isVectorString", () => {
  it("detects valid vector strings", () => {
    expect(isVectorString("[1,2,3]")).toBe(true);
    expect(isVectorString("[0.1,0.2]")).toBe(true);
    expect(isVectorString("[]")).toBe(true);
  });

  it("rejects non-vector strings", () => {
    expect(isVectorString("hello")).toBe(false);
    expect(isVectorString("42")).toBe(false);
    expect(isVectorString('["a","b"]')).toBe(false);
    expect(isVectorString(null)).toBe(false);
    expect(isVectorString(undefined)).toBe(false);
  });

  it("handles whitespace", () => {
    expect(isVectorString(" [1, 2, 3] ")).toBe(true);
  });
});
