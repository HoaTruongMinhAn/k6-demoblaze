import { sleep } from "k6";
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
  sleep(waitTime);
  return waitTime;
}

/**
 * Random sleep between specified range (alias for thinkTime)
 * @param {number} min - Minimum seconds to wait
 * @param {number} max - Maximum seconds to wait
 * @returns {number} Actual wait time used
 */
export function randomSleep(min = 1, max = 3) {
  return thinkTime(min, max);
}

/**
 * Short random sleep (0-2 seconds) - commonly used before test actions
 * @returns {number} Actual wait time used
 */
export function preActionDelay() {
  return thinkTime(0, 2);
}

/**
 * Medium random sleep (1-3 seconds) - commonly used between test actions
 * @returns {number} Actual wait time used
 */
export function betweenActionDelay() {
  return thinkTime(1, 3);
}

/**
 * Long random sleep (3-5 seconds) - for longer waits
 * @returns {number} Actual wait time used
 */
export function longDelay() {
  return thinkTime(3, 5);
}
