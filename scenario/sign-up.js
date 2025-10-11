import { check, sleep } from "k6";
import { configManager } from "../ConfigManager.js";
import { CONSTANTS } from "../constant.js";
import { signUp } from "../modules/api/auth-api.js";
import { randomIntBetween } from "https://jslib.k6.io/k6-utils/1.2.0/index.js";

const testOptions = configManager.getTestOptions();

export const options = {
  vus: testOptions.vus,
  duration: testOptions.duration,
  thresholds: testOptions.thresholds,
};

export default function () {
  // Think time before action
  sleep(randomIntBetween(0, 2));

  // Generate unique user credentials
  const userInfo = configManager.generateUserInfo();
  console.log(`Testing sign-up for user: ${userInfo.username}`);

  // Perform sign-up API call
  const response = signUp(userInfo.username, userInfo.password);

  // Log response details for debugging
  console.log(`Response status: ${response.status}`);
  console.log(`Response body: ${response.body}`);

  // Validate response
  check(response, {
    "sign-up successful (status 200)": (r) =>
      r.status === CONSTANTS.HTTP_STATUS.OK,
    "response body is empty string": (r) => r.body.trim() === '""',
  });

  // Think time after action
  sleep(randomIntBetween(1, 3));
}
