import http from "k6/http";
import { check } from "k6";
import { configManager } from "../ConfigManager.js";
import { CONSTANTS } from "../constant.js";

/**
 * Smoke Test - Validates basic system functionality
 * - Verifies configuration is valid
 * - Checks if the main page loads successfully
 */
export default function () {
  console.log("=== Starting Smoke Test ===");

  // Validate configuration before running tests
  configManager.validate();
  configManager.log();

  // Test: Verify main page loads successfully
  const response = http.get("https://www.demoblaze.com/index.html");
  console.log(`Homepage response status: ${response.status}`);

  // Validate response
  const checksPass = check(response, {
    "homepage loads (status 200)": (r) => r.status === CONSTANTS.HTTP_STATUS.OK,
    "homepage contains product store": (r) => r.body.includes("PRODUCT STORE"),
  });

  if (checksPass) {
    console.log("✅ Smoke test passed");
  } else {
    console.log("❌ Smoke test failed");
  }
}
