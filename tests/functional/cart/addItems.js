import { configManager } from "../../../src/config/config-manager.js";
import {
  signUpAndValidate,
  loginAndValidate,
} from "../../../src/api/auth-api.js";
import { getTestProfile } from "../../../src/config/test-profiles.js";
import {
  preActionDelay,
  betweenActionDelay,
} from "../../../src/utils/timing.js";
import {
  addRandomProductsToCartAndValidate,
  getToken,
} from "../../../src/api/product-api.js";

/**
 * Functional Test: Add Items to Cart
 * Tests the cart functionality workflow
 *
 * Configuration:
 * - Test profile can be set via TEST_PROFILE environment variable
 * - Defaults to 'functional' profile for business workflow validation
 * - Available profiles: smoke, functional, load, stress, spike, mix
 * - Run mode can be set via RUN_MODE environment variable (local|cloud)
 * - Defaults to 'cloud' mode for direct k6 cloud execution
 *
 * Test Steps:
 * 1. Generate unique user credentials
 * 2. Sign up user
 * 3. Login user
 * 4. Add random products to cart
 * 5. Validate cart operations
 *
 * Usage:
 * # Default functional profile
 * k6 cloud tests/functional/cart/addItems.js
 *
 * # Specific test profile
 * TEST_PROFILE=load k6 cloud tests/functional/cart/addItems.js
 * TEST_PROFILE=stress k6 run -o cloud tests/functional/cart/addItems.js
 *
 * # Via run-functional-tests.sh (recommended)
 * ./scripts/run-functional-tests.sh cloud
 * ./scripts/run-functional-tests.sh local
 */

// Get test profile from environment variable or default to functional
const testProfileName = __ENV.TEST_PROFILE || "functional";
const testProfile = getTestProfile(testProfileName);

// Get run mode (local|cloud) - defaults to cloud for direct k6 cloud execution
const runMode = __ENV.RUN_MODE || "cloud";

export const options = {
  vus: testProfile.vus,
  duration: testProfile.duration,
  thresholds: testProfile.thresholds,
  cloud: {
    projectID: testProfile.cloud.projectID,
  },
  tags: {
    test_type: testProfileName,
    feature: "cart",
  },
};

export default function () {
  preActionDelay();
  const user = configManager.generateUserInfo("customer");
  signUpAndValidate(user);

  const loginResponse = loginAndValidate(user);
  const token = getToken(loginResponse);

  const cartResult = addRandomProductsToCartAndValidate(token);
  console.log(`Added ${cartResult.totalProducts} products to cart`);

  betweenActionDelay();
}
