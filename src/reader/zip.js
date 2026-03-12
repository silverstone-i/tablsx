// Copyright © 2026 – present NapSoft LLC. All rights reserved.
import { unzipSync } from "fflate";

/**
 * Extract all files from a ZIP buffer.
 * @param {Buffer|Uint8Array} buffer
 * @returns {Map<string, Uint8Array>} Map of file path → file contents
 */
export function extractZip(buffer) {
  const data = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  const files = unzipSync(data);
  const result = new Map();
  for (const [path, content] of Object.entries(files)) {
    result.set(path, content);
  }
  return result;
}

/**
 * Read a file from the ZIP as a UTF-8 string.
 * @param {Map<string, Uint8Array>} files
 * @param {string} path
 * @returns {string|null}
 */
export function readFileAsString(files, path) {
  const data = files.get(path);
  if (!data) return null;
  return new TextDecoder().decode(data);
}
