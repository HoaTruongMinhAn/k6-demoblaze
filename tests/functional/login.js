import { check, sleep } from "k6";
import { configManager } from "../../src/config/config-manager.js";
import { CONSTANTS } from "../../src/config/constants.js";
import { login } from "../../src/api/auth-api.js";
import { getTestProfile } from "../../src/config/test-profiles.js";
import { getExistingUser } from "../../src/utils/test-data.js";
import { randomIntBetween } from "https://jslib.k6.io/k6-utils/1.2.0/index.js";

/**
 * Functional Test: User Login
 * Tests the user registration workflow
 *
 * Test Steps:
 * 1. Generate unique user credentials
 * 2. Send login request
 * 3. Validate successful login
 * 4. Send login request
 * 5. Validate successful login
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
  const userInfo = getExistingUser("customer");
  const response = login(userInfo.username, userInfo.password);

  check(response, {
    "login successful (status 200)": (r) =>
      r.status === CONSTANTS.HTTP_STATUS.OK,
    "login response has Auth_token property": (r) => r.body.Auth_token !== null,
  });

  sleep(randomIntBetween(1, 3));
}
