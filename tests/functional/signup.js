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
  sleep(randomIntBetween(0, 2));
  const user = configManager.generateUserInfo("customer");
  const response = signUp(user);

  check(response, {
    "sign-up successful (status 200)": (r) =>
      r.status === CONSTANTS.HTTP_STATUS.OK,
    "response body is empty string": (r) => r.body.trim() === '""',
  });

  sleep(randomIntBetween(1, 3));
}
