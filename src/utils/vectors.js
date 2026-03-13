// Copyright © 2026 – present NapSoft LLC. All rights reserved.
/**
 * Serialize a numeric vector to the JSON string format used by `tablsx`.
 *
 * @param {number[]} arr
 * @returns {string}
 */
export function serializeVector(arr) {
  if (!Array.isArray(arr) || !arr.every((v) => Number.isFinite(v))) {
    throw new Error("serializeVector requires an array of finite numbers");
  }
  return JSON.stringify(arr);
}

/**
 * Deserialize a vector string into a numeric array.
 *
 * @param {string} str
 * @returns {number[]}
 */
export function deserializeVector(str) {
  const arr = JSON.parse(str);
  if (!Array.isArray(arr) || !arr.every((v) => typeof v === "number")) {
    throw new Error("Invalid vector string: not an array of numbers");
  }
  return arr;
}

/**
 * Check whether a string looks like a serialized numeric vector.
 *
 * @param {string} str
 * @returns {boolean}
 */
export function isVectorString(str) {
  if (typeof str !== "string") return false;
  const trimmed = str.trim();
  if (!trimmed.startsWith("[") || !trimmed.endsWith("]")) return false;
  try {
    const arr = JSON.parse(trimmed);
    return Array.isArray(arr) && arr.every((v) => typeof v === "number");
  } catch {
    return false;
  }
}
