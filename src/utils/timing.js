import { randomIntBetween } from "https://jslib.k6.io/k6-utils/1.2.0/index.js";

/**
 * Timing Utilities
 * Functions for managing test timing and delays
 */

/**
 * Generate a random wait time and sleep
 * @param {number} min - Minimum seconds to wait
 * @param {number} max - Maximum seconds to wait
 * @returns {number} Actual wait time used
 */
export function thinkTime(min = 1, max = 3) {
  const waitTime = randomIntBetween(min, max);
  return waitTime;
}
