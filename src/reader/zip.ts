// Copyright © 2026 – present NapSoft LLC. All rights reserved.
import { unzipSync } from "fflate";
import type { XlsxInput } from "../model/types.js";

/**
 * Extract all files from a ZIP buffer.
 *
 * @returns Map of file path → file contents.
 */
export function extractZip(buffer: XlsxInput): Map<string, Uint8Array> {
  const data = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  const files = unzipSync(data);
  const result = new Map<string, Uint8Array>();
  for (const [path, content] of Object.entries(files)) {
    result.set(path, content);
  }
  return result;
}

/**
 * Read a file from the ZIP as a UTF-8 string.
 */
export function readFileAsString(
  files: Map<string, Uint8Array>,
  path: string,
): string | null {
  const data = files.get(path);
  if (!data) return null;
  return new TextDecoder().decode(data);
}
