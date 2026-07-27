// Copyright © 2026 – present NapSoft LLC. All rights reserved.
/**
 * Escape a string for safe inclusion in XML text content.
 *
 * @param {string} str
 * @returns {string}
 */
export function escapeXml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
