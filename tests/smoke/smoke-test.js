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
 * Checks:
 * - Configuration is valid
 * - Main page loads successfully
 * - Critical functionality works
 */

// Load smoke test profile from test-profiles configuration
const smokeProfile = getTestProfile("smoke");

export const options = {
  vus: smokeProfile.vus,
  iterations: smokeProfile.iterations,
  thresholds: smokeProfile.thresholds,
  cloud: {
    projectID: smokeProfile.cloud.projectID,
  },
  tags: {
    test_type: "smoke",
    feature: "system_health",
  },
};

export function setup() {
  configManager.validate();
  configManager.logProfile(smokeProfile);
}

export default function () {
  console.log("=== Starting Smoke Test ===");

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
    console.log("✅ Smoke test passed");
  } else {
    console.log("❌ Smoke test failed");
  }

  betweenActionDelay();
}

export function teardown(data) {
  console.log("=== Smoke Test Complete ===");
}
