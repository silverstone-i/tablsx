// Copyright © 2026 – present NapSoft LLC. All rights reserved.
import { zipSync } from "fflate";

/**
 * Package files into a ZIP buffer.
 *
 * @param files Map of file path → XML string content.
 */
export function createZip(files: Map<string, string>): Uint8Array {
  const encoder = new TextEncoder();
  const zipData: Record<string, Uint8Array> = {};

  for (const [path, content] of files) {
    zipData[path] = encoder.encode(content);
  }

  return zipSync(zipData);
}
