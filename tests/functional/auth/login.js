import { configManager } from "../../../src/config/config-manager.js";
import { loginAndValidate } from "../../../src/api/auth-api.js";
import { getTestProfile } from "../../../src/config/test-profiles.js";
import { getExistingUser } from "../../../src/utils/test-data.js";
import {
  preActionDelay,
  betweenActionDelay,
} from "../../../src/utils/timing.js";

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
  preActionDelay();
  const user = getExistingUser("customer");
  loginAndValidate(user);
  betweenActionDelay();
}
