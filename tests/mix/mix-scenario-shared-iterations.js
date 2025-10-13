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
 * Mix Scenario Test - Shared Iterations Approach
 *
 * This demonstrates the correct way to use shared-iterations executor.
 * With shared-iterations, all scenarios share the same pool of VUs and
 * distribute iterations among them based on the specified weights.
 *
 * Distribution:
 * - 20% users only sign up (1 iteration)
 * - 20% users only login (1 iteration)
 * - 60% users sign up then login (3 iterations)
 *
 * Total: 5 iterations shared among VUs
 */

const mixProfile = getTestProfile("mix");

export const options = {
  scenarios: {
    // All scenarios share the same VU pool and distribute iterations
    signup_only: {
      executor: "shared-iterations",
      exec: "signupOnly",
      iterations: 1, // 1 iteration for signup only
      maxDuration: mixProfile.duration,
      tags: { scenario: "signup_only" },
    },

    login_only: {
      executor: "shared-iterations",
      exec: "loginOnly",
      iterations: 1, // 1 iteration for login only
      maxDuration: mixProfile.duration,
      tags: { scenario: "login_only" },
    },

    signup_and_login: {
      executor: "shared-iterations",
      exec: "signupAndLogin",
      iterations: 3, // 3 iterations for signup + login
      maxDuration: mixProfile.duration,
      tags: { scenario: "signup_and_login" },
    },
  },

  // Total VUs that will be shared across all scenarios
  vus: mixProfile.vus,

  thresholds: mixProfile.thresholds,
  tags: {
    test_type: "mix_shared_iterations",
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
  console.log("=== Mix Scenario Test Setup (Shared Iterations) ===");
  console.log(`Total VUs: ${mixProfile.vus}`);
  console.log(`Total Iterations: 5 (1 + 1 + 3)`);
  console.log(`Signup Only: 1 iteration (20%)`);
  console.log(`Login Only: 1 iteration (20%)`);
  console.log(`Signup + Login: 3 iterations (60%)`);
  console.log(`Duration: ${mixProfile.duration}`);
  console.log("VUs will be shared across all scenarios");
}

/**
 * Teardown function - runs once after all scenarios complete
 */
export function teardown(data) {
  console.log("=== Mix Scenario Test Complete ===");
}
