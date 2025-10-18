import { getTestProfile } from "../../../src/config/test-profiles.js";
import { loginWorkflow } from "../../../src/workflows/auth-workflows.js";
import { Counter, Trend } from "k6/metrics";

/**
 * Functional Test: User Login
 * Tests the user login workflow
 *
 * Configuration:
 * - Test profile can be set via TEST_PROFILE environment variable
 * - Defaults to 'functional' profile for business workflow validation
 * - Available profiles: smoke, functional, load, stress, spike, mix
 * - Run mode can be set via RUN_MODE environment variable (local|cloud)
 * - Defaults to 'cloud' mode for direct k6 cloud execution
 *
 * Custom Metrics:
 * - my_counter: Counts number of login requests
 * - new_response_time: Tracks login-specific response times
 *
 * Viewing Trends:
 * - All metrics automatically tracked in k6 Cloud
 * - Access via: https://app.k6.io → Your Project → Trends tab
 * - View 30-day historical trends for all metrics
 *
 * Test Steps:
 * 1. Get existing user credentials
 * 2. Send login request
 * 3. Validate successful login
 *
 * Usage:
 * # Default functional profile
 * k6 cloud tests/functional/auth/login.js
 *
 * # Specific test profile
 * TEST_PROFILE=load k6 cloud tests/functional/auth/login.js
 * TEST_PROFILE=stress k6 run -o cloud tests/functional/auth/login.js
 *
 * # Via run-functional-tests.sh (recommended)
 * ./scripts/run-functional-tests.sh cloud
 * ./scripts/run-functional-tests.sh local
 *
 * Note: View trends at https://app.k6.io → Trends tab (see docs/K6-CLOUD-TRENDS-GUIDE.md)
 */

// Get test profile from environment variable or default to functional
const testProfileName = __ENV.TEST_PROFILE || "functional";
const testProfile = getTestProfile(testProfileName);

// Get run mode (local|cloud) - defaults to cloud for direct k6 cloud execution
const runMode = __ENV.RUN_MODE || "cloud";

// Custom metrics for tracking
let myCounter = new Counter("my_counter");
let newResponseTime = new Trend("new_response_time");

export const options = {
  stages: testProfile.stages,
  thresholds: testProfile.thresholds,
  cloud: {
    projectID: testProfile.cloud.projectID,
  },
  tags: {
    test_type: testProfileName,
    feature: "authentication",
  },
};

export default function () {
  const { loginResponse } = loginWorkflow();
  myCounter.add(1);
  newResponseTime.add(loginResponse.response.timings.duration);
}
