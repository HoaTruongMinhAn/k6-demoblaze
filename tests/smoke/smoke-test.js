import http from "k6/http";
import { check, sleep } from "k6";
import { configManager } from "../../src/config/config-manager.js";
import { CONSTANTS } from "../../src/config/constants.js";
import { getTestProfile } from "../../src/config/test-profiles.js";
import { randomIntBetween } from "https://jslib.k6.io/k6-utils/1.2.0/index.js";

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
  duration: smokeProfile.duration,
  thresholds: {
    http_req_duration: ["p(95)<1000"],
    http_req_failed: ["rate<0.05"],
    checks: ["rate>0.95"],
  },
  tags: {
    test_type: "smoke",
    feature: "system_health",
  },
};

export function setup() {
  // Validate configuration before running tests
  configManager.validate();
  configManager.log();
}

export default function () {
  console.log("=== Starting Smoke Test ===");

  // Test: Verify main page loads successfully
  const response = http.get("https://www.demoblaze.com/index.html");
  console.log(`Homepage response status: ${response.status}`);

  // Validate response
  const checksPass = check(response, {
    "homepage loads (status 200)": (r) => r.status === CONSTANTS.HTTP_STATUS.OK,
    "homepage contains product store": (r) => r.body.includes("PRODUCT STORE"),
    "response time < 2s": (r) => r.timings.duration < 2000,
  });

  if (checksPass) {
    console.log("✅ Smoke test passed");
  } else {
    console.log("❌ Smoke test failed");
  }

  sleep(randomIntBetween(1, 3));
}

export function teardown(data) {
  console.log("=== Smoke Test Complete ===");
}
