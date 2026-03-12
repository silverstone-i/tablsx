// Copyright © 2026 – present NapSoft LLC. All rights reserved.
/**
 * Convert a 0-indexed column number to a letter (A, B, ..., Z, AA, AB, ...).
 * @param {number} col - 0-indexed column number
 * @returns {string}
 */
export function columnToLetter(col) {
  let result = "";
  let n = col;
  while (n >= 0) {
    result = String.fromCharCode((n % 26) + 65) + result;
    n = Math.floor(n / 26) - 1;
  }
  return result;
}

/**
 * Convert a column letter to a 0-indexed column number.
 * @param {string} letter - Column letter (e.g., "A", "AA")
 * @returns {number}
 */
export function letterToColumn(letter) {
  let col = 0;
  for (let i = 0; i < letter.length; i++) {
    col = col * 26 + (letter.charCodeAt(i) - 64);
  }
  return col - 1;
}

/**
 * Encode a 0-indexed row and column to a cell reference (e.g., "A1").
 * @param {number} row - 0-indexed row
 * @param {number} col - 0-indexed column
 * @returns {string}
 */
export function encodeCellRef(row, col) {
  return columnToLetter(col) + (row + 1);
}

/**
 * Decode a cell reference (e.g., "A1") to 0-indexed row and column.
 * @param {string} ref - Cell reference
 * @returns {{ row: number, col: number }}
 */
export function decodeCellRef(ref) {
  const match = ref.match(/^([A-Z]+)(\d+)$/);
  if (!match) throw new Error(`Invalid cell reference: ${ref}`);
  return {
    row: parseInt(match[2], 10) - 1,
    col: letterToColumn(match[1]),
  };
}
