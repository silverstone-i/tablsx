// Copyright © 2026 – present NapSoft LLC. All rights reserved.

/**
 * Zero-based row/column coordinates for a single cell.
 */
export interface CellRef {
  row: number;
  col: number;
}

/**
 * Convert a zero-based column number to an Excel column label.
 */
export function columnToLetter(col: number): string {
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
 * @param letter Column label such as `A` or `AA`.
 */
export function letterToColumn(letter: string): number {
  let col = 0;
  for (let i = 0; i < letter.length; i++) {
    col = col * 26 + (letter.charCodeAt(i) - 64);
  }
  return col - 1;
}

/**
 * Encode zero-based row and column coordinates to an Excel cell reference.
 */
export function encodeCellRef(row: number, col: number): string {
  return columnToLetter(col) + (row + 1);
}

/**
 * Decode an Excel cell reference such as `A1` to zero-based coordinates.
 *
 * @throws {Error} Thrown when the reference is not a valid `A1`-style string.
 */
export function decodeCellRef(ref: string): CellRef {
  const match = /^([A-Z]+)(\d+)$/.exec(ref);
  // Both capture groups are guaranteed by the regex when it matches.
  if (!match || match[1] === undefined || match[2] === undefined) {
    throw new Error(`Invalid cell reference: ${ref}`);
  }
  return {
    row: parseInt(match[2], 10) - 1,
    col: letterToColumn(match[1]),
  };
}
