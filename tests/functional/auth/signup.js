import { configManager } from "../../../src/config/config-manager.js";
import { signUpAndValidate } from "../../../src/api/auth-api.js";
import { getTestProfile } from "../../../src/config/test-profiles.js";
import {
  preActionDelay,
  betweenActionDelay,
} from "../../../src/utils/timing.js";

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
  preActionDelay();
  const user = configManager.generateUserInfo("customer");
  signUpAndValidate(user);
  betweenActionDelay();
}
