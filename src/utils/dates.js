// Copyright © 2026 – present NapSoft LLC. All rights reserved.
/**
 * Convert an Excel serial date number to a JavaScript Date (UTC).
 * Handles the Lotus 1-2-3 leap year bug (serial 60 = 1900-02-29 which doesn't exist).
 * @param {number} serial
 * @returns {Date}
 */
export function excelDateToJS(serial) {
  // Excel epoch is 1900-01-01 = serial 1
  // But Excel incorrectly treats 1900 as a leap year (Lotus 1-2-3 bug)
  // Serial 60 = 1900-02-29 (doesn't exist)
  // For serial >= 60, subtract 1 to correct for the phantom leap day
  if (serial < 1) {
    // Time-only value: fraction of a day
    const ms = Math.round(serial * 86400000);
    return new Date(Date.UTC(1899, 11, 31, 0, 0, 0, ms));
  }

  let adjustedSerial = serial;
  if (serial >= 60) {
    adjustedSerial = serial - 1;
  }
  // Serial 1 = 1900-01-01
  // Days from 1899-12-31 (JS epoch adjustment)
  const ms = Math.round((adjustedSerial - 1) * 86400000);
  const epoch = Date.UTC(1900, 0, 1);
  return new Date(epoch + ms);
}

/**
 * Convert a JavaScript Date to an Excel serial date number.
 * @param {Date} date
 * @returns {number}
 */
export function jsDateToExcel(date) {
  const epoch = Date.UTC(1900, 0, 1);
  const ms = date.getTime() - epoch;
  let serial = ms / 86400000 + 1;
  // Add 1 for the phantom leap day if date is after 1900-02-28
  if (serial >= 60) {
    serial += 1;
  }
  return serial;
}
