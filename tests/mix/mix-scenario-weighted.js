import { configManager } from "../../src/config/config-manager.js";
import {
  signUpAndValidate,
  loginAndValidate,
  signUpAndLoginWithValidation,
} from "../../src/api/auth-api.js";
import {
  getTestProfile,
  getDistributionProfile,
  generateScenariosConfig,
  calculateVUDistribution,
} from "../../src/config/test-profiles.js";
import { getExistingUser } from "../../src/utils/test-data.js";
import { preActionDelay, betweenActionDelay } from "../../src/utils/timing.js";

/**
 * Mix Scenario Test - Dynamic Weighted Distribution Approach
 *
 * This uses a flexible distribution system that allows easy configuration
 * of different user behavior patterns without hardcoding percentages.
 *
 * Configuration:
 * - Distribution profile can be set via DISTRIBUTION_PROFILE environment variable
 * - Defaults to 'auth_basic' profile (20% signup, 20% login, 60% signup+login)
 * - Available profiles: auth_basic, ecommerce, high_conversion, browse_heavy, load_test
 *
 * Usage:
 * DISTRIBUTION_PROFILE=ecommerce k6 run mix-scenario-weighted.js
 */

// Get test profile and distribution profile
const mixProfile = getTestProfile("mix");
const distributionProfileName = __ENV.DISTRIBUTION_PROFILE || "auth_basic";
const distributionProfile = getDistributionProfile(distributionProfileName);

// Override VU and duration from environment variables if provided
const vus = __ENV.VUS ? parseInt(__ENV.VUS) : mixProfile.vus;
const duration = __ENV.DURATION || mixProfile.duration;

// Generate dynamic scenarios configuration
export const options = generateScenariosConfig(
  distributionProfile,
  vus,
  duration,
  mixProfile.thresholds
);

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
 * Add to cart scenario - Users adding items to cart
 * TODO: Implement when cart functionality is available
 */
export function addToCart() {
  preActionDelay();
  // Placeholder for future cart functionality
  console.log("Add to cart scenario - Not yet implemented");
  betweenActionDelay();
}

/**
 * Place order scenario - Users completing purchases
 * TODO: Implement when order functionality is available
 */
export function placeOrder() {
  preActionDelay();
  // Placeholder for future order functionality
  console.log("Place order scenario - Not yet implemented");
  betweenActionDelay();
}

/**
 * Setup function - runs once before all scenarios
 */
export function setup() {
  console.log("=== Mix Scenario Test Setup (Dynamic Weighted) ===");
  console.log(`Distribution Profile: ${distributionProfileName}`);
  console.log(`Total VUs: ${mixProfile.vus}`);
  console.log(`Duration: ${mixProfile.duration}`);
  console.log("");

  // Calculate and display VU distribution
  const vusDistribution = calculateVUDistribution(
    distributionProfile,
    mixProfile.vus
  );

  console.log("VU Distribution:");
  Object.entries(distributionProfile.scenarios).forEach(
    ([scenarioName, scenarioConfig]) => {
      const vus = vusDistribution[scenarioName];
      const percentage = ((vus / mixProfile.vus) * 100).toFixed(1);
      console.log(
        `  ${scenarioName}: ${vus} VUs (${percentage}%) - ${scenarioConfig.description}`
      );
    }
  );

  console.log("");
  console.log("Available Distribution Profiles:");
  console.log("  auth_basic: Basic authentication flow (current default)");
  console.log("  ecommerce: E-commerce focused with shopping behaviors");
  console.log("  high_conversion: Optimized for purchase completion");
  console.log("  browse_heavy: Users mostly browsing");
  console.log("  load_test: Equal distribution for stress testing");
  console.log("");
  console.log(
    `Usage: DISTRIBUTION_PROFILE=${distributionProfileName} k6 run mix-scenario-weighted.js`
  );
  console.log(
    "Available profiles: auth_basic, ecommerce, high_conversion, browse_heavy, load_test"
  );
}

/**
 * Teardown function - runs once after all scenarios complete
 */
export function teardown(data) {
  console.log("=== Mix Scenario Test Complete ===");
}
