import { getTestProfile } from "../../../src/config/test-profiles.js";
import { placeOrderWorkflow } from "../../../src/workflows/cart-workflows.js";

/**
 * Functional Test: Add Items to Cart and View Cart
 * Tests the complete cart functionality workflow
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
 * 4. Validate empty cart
 * 5. Add random products to cart
 * 6. Validate cart has products
 *
 * Usage:
 * # Default functional profile
 * k6 cloud tests/functional/cart/addItems-viewCart.js
 *
 * # Specific test profile
 * TEST_PROFILE=load k6 cloud tests/functional/cart/addItems-viewCart.js
 * TEST_PROFILE=stress k6 run -o cloud tests/functional/cart/addItems-viewCart.js
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
  stages: testProfile.stages,
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
  placeOrderWorkflow();
}
