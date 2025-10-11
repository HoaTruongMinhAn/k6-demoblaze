import { check, sleep } from "k6";
import { configManager } from "../../src/config/config-manager.js";
import { CONSTANTS } from "../../src/config/constants.js";
import { signUp } from "../../src/api/auth-api.js";
import { getTestProfile } from "../../src/config/test-profiles.js";
import { randomIntBetween } from "https://jslib.k6.io/k6-utils/1.2.0/index.js";

/**
 * Functional Test: User Sign Up
 * Tests the user registration workflow
 *
 * Test Steps:
 * 1. Generate unique user credentials
 * 2. Send sign-up request
 * 3. Validate successful registration
 */

// Load functional test profile from test-profiles configuration
const functionalProfile = getTestProfile("functional");

export const options = {
  vus: functionalProfile.vus,
  duration: functionalProfile.duration,
  thresholds: functionalProfile.thresholds,
  tags: {
    test_type: "functional",
    feature: "authentication",
  },
};

export default function () {
  // Think time before action (simulating user behavior)
  sleep(randomIntBetween(0, 2));

  // Generate unique user credentials
  const userInfo = configManager.generateUserInfo();
  console.log(`Testing sign-up for user: ${userInfo.username}`);

  // Perform sign-up API call
  const response = signUp(userInfo.username, userInfo.password);

  // Log response details for debugging
  console.log(`Response status: ${response.status}`);
  console.log(`Response body: ${response.body}`);

  // Validate response
  check(response, {
    "sign-up successful (status 200)": (r) =>
      r.status === CONSTANTS.HTTP_STATUS.OK,
    "response body is empty string": (r) => r.body.trim() === '""',
  });

  // Think time after action (simulating user behavior)
  sleep(randomIntBetween(1, 3));
}
