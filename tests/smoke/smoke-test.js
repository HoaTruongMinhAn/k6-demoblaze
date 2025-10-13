import http from "k6/http";
import { check, sleep } from "k6";
import { configManager } from "../../src/config/config-manager.js";
import { CONSTANTS } from "../../src/config/constants.js";
import { getTestProfile } from "../../src/config/test-profiles.js";
import { randomIntBetween } from "https://jslib.k6.io/k6-utils/1.2.0/index.js";
import { login } from "../../src/api/auth-api.js";
import { getExistingUser } from "../../src/utils/test-data.js";

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
  const loginResponse = login(user);

  const checkLoginPass = check(loginResponse, {
    "login successful (status 200)": (r) =>
      r.status === CONSTANTS.HTTP_STATUS.OK,
    "login response has Auth_token property": (r) => r.body.Auth_token !== null,
    "response time < 2s": (r) => r.timings.duration < 2000,
  });

  if (checkLandingPass && checkLoginPass) {
    console.log("✅ Smoke test passed");
  } else {
    console.log("❌ Smoke test failed");
  }

  sleep(randomIntBetween(1, 3));
}

export function teardown(data) {
  console.log("=== Smoke Test Complete ===");
}
