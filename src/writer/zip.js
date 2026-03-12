// Copyright © 2026 – present NapSoft LLC. All rights reserved.
import { zipSync } from "fflate";

/**
 * Package files into a ZIP buffer.
 * @param {Map<string, string>} files - Map of file path → XML string content
 * @returns {Uint8Array}
 */
export function createZip(files) {
  const encoder = new TextEncoder();
  const zipData = {};

  for (const [path, content] of files) {
    zipData[path] = encoder.encode(content);
  }

  return zipSync(zipData);
}
