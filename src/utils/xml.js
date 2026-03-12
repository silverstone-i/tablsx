// Copyright © 2026 – present NapSoft LLC. All rights reserved.
/**
 * Escape a string for use in XML content.
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
