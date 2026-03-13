// Copyright © 2026 – present NapSoft LLC. All rights reserved.
/**
 * Convert a zero-based column number to an Excel column label.
 *
 * @param {number} col Zero-based column number.
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
 * Convert an Excel column label to a zero-based column number.
 *
 * @param {string} letter Column label such as `A` or `AA`.
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
 * Encode zero-based row and column coordinates to an Excel cell reference.
 *
 * @param {number} row Zero-based row index.
 * @param {number} col Zero-based column index.
 * @returns {string}
 */
export function encodeCellRef(row, col) {
  return columnToLetter(col) + (row + 1);
}

/**
 * Decode an Excel cell reference such as `A1` to zero-based coordinates.
 *
 * @param {string} ref Cell reference.
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
