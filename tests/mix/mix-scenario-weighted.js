import { configManager } from "../../src/config/config-manager.js";
import {
  signUpAndValidate,
  loginAndValidate,
  signUpAndLoginWithValidation,
} from "../../src/api/auth-api.js";
import {
  addRandomProductsToCartAndValidate,
  viewCart as viewCartAPI,
  validateCartHasProducts,
  validateCartEmpty,
  getToken,
} from "../../src/api/product-api.js";
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
 * - Test profile can be set via TEST_PROFILE environment variable
 * - Defaults to 'mix' profile for mixed user behavior testing
 * - Available test profiles: smoke, functional, load, stress, spike, mix
 * - Distribution profile can be set via DISTRIBUTION_PROFILE environment variable
 * - Defaults to 'auth_basic' profile (20% signup, 20% login, 60% signup+login)
 * - Available distribution profiles: auth_basic, ecommerce, high_conversion, browse_heavy, load_test
 * - Run mode can be set via RUN_MODE environment variable (local|cloud)
 * - Defaults to 'cloud' mode for direct k6 cloud execution
 *
 * Usage:
 * # Cloud mode (default) with mix profile
 * DISTRIBUTION_PROFILE=ecommerce k6 cloud mix-scenario-weighted.js
 *
 * # Local mode with mix profile
 * DISTRIBUTION_PROFILE=ecommerce k6 run -o cloud mix-scenario-weighted.js
 *
 * # Cloud mode with specific test profile
 * TEST_PROFILE=load DISTRIBUTION_PROFILE=ecommerce k6 cloud mix-scenario-weighted.js
 * TEST_PROFILE=stress DISTRIBUTION_PROFILE=ecommerce k6 run -o cloud mix-scenario-weighted.js
 *
 * # Via run-distribution-tests.sh (recommended)
 * ./scripts/run-distribution-tests.sh cloud ecommerce
 * ./scripts/run-distribution-tests.sh local ecommerce
 */

// Get test profile from environment variable or default to mix
const testProfileName = __ENV.TEST_PROFILE || "mix";
const testProfile = getTestProfile(testProfileName);
const distributionProfileName = __ENV.DISTRIBUTION_PROFILE || "auth_basic";
const distributionProfile = getDistributionProfile(distributionProfileName);

// Get run mode (local|cloud) - defaults to cloud for direct k6 cloud execution
const runMode = __ENV.RUN_MODE || "cloud";

// Override VU and duration from environment variables if provided
const vus = __ENV.VUS ? parseInt(__ENV.VUS) : testProfile.vus;
const duration = __ENV.DURATION || testProfile.duration;

// Generate dynamic scenarios configuration
export const options = generateScenariosConfig(
  distributionProfile,
  vus,
  duration,
  testProfile.thresholds,
  testProfile.cloud
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
 * Implements the addItems.js functionality
 */
export function addToCart() {
  preActionDelay();
  const user = configManager.generateUserInfo("customer");
  signUpAndValidate(user);

  const loginResponse = loginAndValidate(user);
  const token = getToken(loginResponse);

  const cartResult = addRandomProductsToCartAndValidate(token);
  console.log(`Added ${cartResult.totalProducts} products to cart`);

  betweenActionDelay();
}

/**
 * Place order scenario - Users completing purchases
 * Implements the addItems-viewCart.js functionality (full cart flow)
 */
export function placeOrder() {
  preActionDelay();
  const user = configManager.generateUserInfo("customer");
  signUpAndValidate(user);

  const loginResponse = loginAndValidate(user);
  const token = getToken(loginResponse);

  // Check empty cart first
  validateCartEmpty(token);

  // Add items to cart
  const cartResult = addRandomProductsToCartAndValidate(token);
  console.log(`Added ${cartResult.totalProducts} products to cart`);

  // Verify cart has products
  validateCartHasProducts(token);

  betweenActionDelay();
}

/**
 * View cart scenario - Users viewing their cart
 * Implements the viewCart.js functionality
 */
export function viewCart() {
  preActionDelay();
  const user = configManager.generateUserInfo("customer");
  signUpAndValidate(user);

  const loginResponse = loginAndValidate(user);
  const token = getToken(loginResponse);

  // Check that cart is empty
  validateCartEmpty(token);

  betweenActionDelay();
}

/**
 * Setup function - runs once before all scenarios
 */
export function setup() {
  console.log("=== Mix Scenario Test Setup (Dynamic Weighted) ===");
  console.log(`Test Profile: ${testProfileName}`);
  console.log(`Run Mode: ${runMode}`);
  console.log(`Distribution Profile: ${distributionProfileName}`);
  console.log(`Total VUs: ${testProfile.vus}`);
  console.log(`Duration: ${testProfile.duration}`);
  console.log("");

  // Calculate and display VU distribution
  const vusDistribution = calculateVUDistribution(
    distributionProfile,
    testProfile.vus
  );

  console.log("VU Distribution:");
  Object.entries(distributionProfile.scenarios).forEach(
    ([scenarioName, scenarioConfig]) => {
      const vus = vusDistribution[scenarioName];
      const percentage = ((vus / testProfile.vus) * 100).toFixed(1);
      console.log(
        `  ${scenarioName}: ${vus} VUs (${percentage}%) - ${scenarioConfig.description}`
      );
    }
  );

  console.log("");
  console.log("Available Test Profiles:");
  console.log("  smoke: Quick validation (1 VU, 1 iteration)");
  console.log("  functional: Business workflow validation (2 VUs, 5s)");
  console.log("  load: Expected production load (3 VUs, 10s)");
  console.log("  stress: Beyond expected load (4 VUs, 10s)");
  console.log("  spike: Sudden traffic spike (5 VUs, 3s)");
  console.log("  mix: Mixed user behavior (5 VUs, 5s) - current default");
  console.log("");
  console.log("Available Distribution Profiles:");
  console.log("  auth_basic: Basic authentication flow (current default)");
  console.log("  ecommerce: E-commerce focused with shopping behaviors");
  console.log("  high_conversion: Optimized for purchase completion");
  console.log("  browse_heavy: Users mostly browsing");
  console.log("  load_test: Equal distribution for stress testing");
  console.log("");
  console.log("Run Modes:");
  console.log("  cloud: Runs directly on k6 cloud infrastructure (default)");
  console.log("  local: Runs locally and streams output to cloud");
  console.log("");
  console.log("Usage Examples:");
  console.log(
    `  # Current profile: TEST_PROFILE=${testProfileName} DISTRIBUTION_PROFILE=${distributionProfileName} k6 cloud mix-scenario-weighted.js`
  );
  console.log(
    `  # Different test profile: TEST_PROFILE=load DISTRIBUTION_PROFILE=${distributionProfileName} k6 cloud mix-scenario-weighted.js`
  );
  console.log(
    `  # Local mode: TEST_PROFILE=${testProfileName} DISTRIBUTION_PROFILE=${distributionProfileName} k6 run -o cloud mix-scenario-weighted.js`
  );
  console.log(
    "  # Via script (recommended): ./scripts/run-distribution-tests.sh cloud ecommerce"
  );
  console.log(
    "  # Via script (local): ./scripts/run-distribution-tests.sh local ecommerce"
  );
  console.log("");
  console.log(
    "Available test profiles: smoke, functional, load, stress, spike, mix"
  );
  console.log(
    "Available distribution profiles: auth_basic, ecommerce, high_conversion, browse_heavy, load_test"
  );
}

/**
 * Teardown function - runs once after all scenarios complete
 */
export function teardown(data) {
  console.log("=== Mix Scenario Test Complete ===");
}
