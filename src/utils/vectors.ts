// Copyright © 2026 – present NapSoft LLC. All rights reserved.

/**
 * Serialize a numeric vector to the JSON string format used by `tablsx`.
 *
 * @throws {Error} Thrown when the input is not an array of finite numbers.
 */
export function serializeVector(arr: number[]): string {
  if (!Array.isArray(arr) || !arr.every((v) => Number.isFinite(v))) {
    throw new Error("serializeVector requires an array of finite numbers");
  }
  return JSON.stringify(arr);
}

/**
 * Deserialize a vector string into a numeric array.
 *
 * @throws {Error} Thrown when the string is not a JSON array of numbers.
 */
export function deserializeVector(str: string): number[] {
  const arr: unknown = JSON.parse(str);
  if (!Array.isArray(arr) || !arr.every((v) => typeof v === "number")) {
    throw new Error("Invalid vector string: not an array of numbers");
  }
  return arr as number[];
}

/**
 * Check whether a string looks like a serialized numeric vector.
 */
export function isVectorString(str: string): boolean {
  if (typeof str !== "string") return false;
  const trimmed = str.trim();
  if (!trimmed.startsWith("[") || !trimmed.endsWith("]")) return false;
  try {
    const arr: unknown = JSON.parse(trimmed);
    return Array.isArray(arr) && arr.every((v) => typeof v === "number");
  } catch {
    return false;
  }
}
