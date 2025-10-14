import http from "k6/http";
import { check } from "k6";
import { configManager } from "../../src/config/config-manager.js";
import { CONSTANTS } from "../../src/config/constants.js";
import { getTestProfile } from "../../src/config/test-profiles.js";
import { loginAndValidate } from "../../src/api/auth-api.js";
import { getExistingUser } from "../../src/utils/test-data.js";
import { betweenActionDelay } from "../../src/utils/timing.js";

/**
 * Smoke Test - Validates basic system functionality
 *
 * Purpose: Quick validation that the system is running
 * Duration: Short (typically < 1 minute)
 * Load: Minimal (1-2 VUs)
 *
 * Configuration:
 * - Test profile can be set via TEST_PROFILE environment variable
 * - Defaults to 'smoke' profile for quick validation
 * - Available profiles: smoke, functional, load, stress, spike, mix
 * - Run mode can be set via RUN_MODE environment variable (local|cloud)
 * - Defaults to 'cloud' mode for direct k6 cloud execution
 *
 * Usage:
 * # Default smoke profile
 * k6 cloud tests/smoke/smoke-test.js
 *
 * # Specific test profile
 * TEST_PROFILE=load k6 cloud tests/smoke/smoke-test.js
 * TEST_PROFILE=stress k6 run -o cloud tests/smoke/smoke-test.js
 *
 * # Via run-smoke-tests.sh (recommended)
 * ./scripts/run-smoke-tests.sh cloud
 * ./scripts/run-smoke-tests.sh local
 */

// Get test profile from environment variable or default to smoke
const testProfileName = __ENV.TEST_PROFILE || "smoke";
const testProfile = getTestProfile(testProfileName);

// Get run mode (local|cloud) - defaults to cloud for direct k6 cloud execution
const runMode = __ENV.RUN_MODE || "cloud";

export const options = {
  vus: testProfile.vus,
  iterations: testProfile.iterations,
  duration: testProfile.duration,
  thresholds: testProfile.thresholds,
  cloud: {
    projectID: testProfile.cloud.projectID,
  },
  tags: {
    test_type: testProfileName,
    feature: "system_health",
  },
};

export function setup() {
  configManager.validate();
  configManager.logProfile(testProfile);

  console.log("=== Test Configuration ===");
  console.log(`Test Profile: ${testProfileName}`);
  console.log(`Run Mode: ${runMode}`);
  console.log(`VUs: ${testProfile.vus}`);
  console.log(`Iterations: ${testProfile.iterations}`);
  console.log(`Duration: ${testProfile.duration}`);
}

export default function () {
  console.log(`=== Starting ${testProfileName.toUpperCase()} Test ===`);

  const landingUrl = configManager.getWebUrl("LANDING");
  console.log(`Landing URL: ${landingUrl}`);

  // Test: Verify main page loads successfully
  const response = http.get(landingUrl);

  const checkLandingPass = check(response, {
    "homepage loads (status 200)": (r) => r.status === CONSTANTS.HTTP_STATUS.OK,
    "homepage contains product store": (r) => r.body.includes("PRODUCT STORE"),
    "response time < 2s": (r) => r.timings.duration < 2000,
  });

  // Test: Verify login works successfully
  const user = getExistingUser("customer");
  const loginResult = loginAndValidate(user);

  // Additional response time check for smoke test
  const checkLoginPass =
    check(loginResult.response, {
      "response time < 2s": (r) => r.timings.duration < 2000,
    }) && loginResult.validationPassed;

  if (checkLandingPass && checkLoginPass) {
    console.log(`✅ ${testProfileName} test passed`);
  } else {
    console.log(`❌ ${testProfileName} test failed`);
  }

  betweenActionDelay();
}

export function teardown(data) {
  console.log(`=== ${testProfileName.toUpperCase()} Test Complete ===`);
}
