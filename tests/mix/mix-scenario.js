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
 * Mix Scenario Test - Realistic User Behavior Simulation
 *
 * This test simulates realistic user behavior patterns:
 * - 20% users only sign up (new users exploring the platform)
 * - 20% users only login (returning users)
 * - 60% users sign up then login (new users completing registration)
 *
 * This distribution mimics real-world usage patterns where most new users
 * complete the full registration flow, while some users are returning
 * and some abandon the signup process.
 */

const mixProfile = getTestProfile("mix");

export const options = {
  scenarios: {
    // Signup only scenario (20% of users)
    signup_only: {
      executor: "constant-vus",
      vus: Math.ceil(mixProfile.vus * 0.2), // 20% of total VUs
      duration: mixProfile.duration,
      tags: { scenario: "signup_only" },
    },

    // Login only scenario (20% of users)
    login_only: {
      executor: "constant-vus",
      vus: Math.ceil(mixProfile.vus * 0.2), // 20% of total VUs
      duration: mixProfile.duration,
      tags: { scenario: "login_only" },
    },

    // Signup + Login scenario (60% of users)
    signup_and_login: {
      executor: "constant-vus",
      vus: Math.ceil(mixProfile.vus * 0.6), // 60% of total VUs
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
 * Main test function - routes to appropriate scenario based on VU
 */
export default function () {
  // Get the scenario name from the current VU's scenario
  const scenario = __ENV.SCENARIO || "signup_and_login";

  switch (scenario) {
    case "signup_only":
      signupOnly();
      break;
    case "login_only":
      loginOnly();
      break;
    case "signup_and_login":
    default:
      signupAndLogin();
      break;
  }
}

/**
 * Setup function - runs once before all scenarios
 */
export function setup() {
  console.log("=== Mix Scenario Test Setup ===");
  console.log(`Total VUs: ${mixProfile.vus}`);
  console.log(`Signup Only VUs: ${Math.ceil(mixProfile.vus * 0.2)} (20%)`);
  console.log(`Login Only VUs: ${Math.ceil(mixProfile.vus * 0.2)} (20%)`);
  console.log(`Signup + Login VUs: ${Math.ceil(mixProfile.vus * 0.6)} (60%)`);
  console.log(`Duration: ${mixProfile.duration}`);
}

/**
 * Teardown function - runs once after all scenarios complete
 */
export function teardown(data) {
  console.log("=== Mix Scenario Test Complete ===");
}
