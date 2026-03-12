// Copyright © 2026 – present NapSoft LLC. All rights reserved.
/**
 * Serialize a number array to a JSON string.
 * @param {number[]} arr
 * @returns {string}
 */
export function serializeVector(arr) {
  return JSON.stringify(arr);
}

/**
 * Deserialize a JSON string to a number array.
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
 * Check if a string looks like a JSON array of numbers.
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
