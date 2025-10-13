import { configManager } from "../../src/config/config-manager.js";
import {
  signUpAndValidate,
  loginAndValidate,
  signUpAndLoginWithValidation,
} from "../../src/api/auth-api.js";
import { getTestProfile } from "../../src/config/test-profiles.js";
import { getExistingUser } from "../../src/utils/test-data.js";
import { preActionDelay, betweenActionDelay } from "../../src/utils/timing.js";

/**
 * Mix Scenario Test - Weighted Distribution Approach
 *
 * This is the K6 expert's preferred approach using weighted scenarios.
 * K6 automatically distributes VUs across scenarios based on weights.
 *
 * Distribution:
 * - 20% users only sign up (weight: 2)
 * - 20% users only login (weight: 2)
 * - 60% users sign up then login (weight: 6)
 *
 * Total weight: 10 (2 + 2 + 6)
 * Percentages: 2/10=20%, 2/10=20%, 6/10=60%
 */

const mixProfile = getTestProfile("mix");

export const options = {
  scenarios: {
    // Weighted scenarios using constant-vus executor (simpler approach)
    signup_only: {
      executor: "constant-vus",
      exec: "signupOnly",
      vus: Math.ceil(mixProfile.vus * 0.2), // 20% of VUs
      duration: mixProfile.duration,
      tags: { scenario: "signup_only" },
    },

    login_only: {
      executor: "constant-vus",
      exec: "loginOnly",
      vus: Math.ceil(mixProfile.vus * 0.2), // 20% of VUs
      duration: mixProfile.duration,
      tags: { scenario: "login_only" },
    },

    signup_and_login: {
      executor: "constant-vus",
      exec: "signupAndLogin",
      vus: Math.ceil(mixProfile.vus * 0.6), // 60% of VUs
      duration: mixProfile.duration,
      tags: { scenario: "signup_and_login" },
    },
  },

  thresholds: mixProfile.thresholds,
  tags: {
    test_type: "mix",
    feature: "authentication",
  },
};

/**
 * Signup only scenario - New users who abandon after signup
 */
export function signupOnly() {
  preActionDelay();
  const user = configManager.generateUserInfo("customer");
  signUpAndValidate(user);
  betweenActionDelay();
}

/**
 * Login only scenario - Returning users
 */
export function loginOnly() {
  preActionDelay();
  const user = getExistingUser("customer");
  loginAndValidate(user);
  betweenActionDelay();
}

/**
 * Signup and login scenario - New users completing full flow
 */
export function signupAndLogin() {
  preActionDelay();
  const user = configManager.generateUserInfo("customer");
  signUpAndLoginWithValidation(user);
  betweenActionDelay();
}

/**
 * Setup function - runs once before all scenarios
 */
export function setup() {
  console.log("=== Mix Scenario Test Setup (Weighted) ===");
  console.log(`Total VUs: ${mixProfile.vus}`);
  console.log(
    `Signup Only: ${Math.ceil(mixProfile.vus * 0.2)} iterations (20%)`
  );
  console.log(
    `Login Only: ${Math.ceil(mixProfile.vus * 0.2)} iterations (20%)`
  );
  console.log(
    `Signup + Login: ${Math.ceil(mixProfile.vus * 0.6)} iterations (60%)`
  );
  console.log(`Duration: ${mixProfile.duration}`);
}

/**
 * Teardown function - runs once after all scenarios complete
 */
export function teardown(data) {
  console.log("=== Mix Scenario Test Complete ===");
}
