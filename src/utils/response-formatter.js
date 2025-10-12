/**
 * Response Formatting Utilities
 * Functions for formatting responses, logging, and error messages
 */

/**
 * Format response for logging
 * @param {Response} response - HTTP response object
 * @returns {string} Formatted response string
 */
export function formatResponse(response) {
  return JSON.stringify(
    {
      status: response.status,
      statusText: response.status_text,
      duration: `${response.timings.duration}ms`,
      size: `${response.body.length} bytes`,
    },
    null,
    2
  );
}

/**
 * Log test execution details
 * @param {string} testName - Name of the test
 * @param {Object} details - Test details to log
 */
export function logTestExecution(testName, details) {
  console.log(`\n=== ${testName} ===`);
  Object.entries(details).forEach(([key, value]) => {
    console.log(`${key}: ${value}`);
  });
}

/**
 * Create custom error message
 * @param {string} context - Error context
 * @param {Response} response - HTTP response object
 * @returns {string} Formatted error message
 */
export function createErrorMessage(context, response) {
  return `[${context}] Failed with status ${response.status}: ${response.body}`;
}
