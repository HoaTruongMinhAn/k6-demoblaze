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
  viewCart,
  validateCartHasProducts,
  validateCartEmpty,
  getToken,
} from "../../../src/api/product-api.js";

const functionalProfile = getTestProfile("functional");

export const options = {
  vus: functionalProfile.vus,
  duration: functionalProfile.duration,
  thresholds: functionalProfile.thresholds,
  tags: {
    test_type: "functional",
    feature: "authentication",
  },
};

export default function () {
  preActionDelay();
  const user = configManager.generateUserInfo("customer");
  signUpAndValidate(user);

  const loginResponse = loginAndValidate(user);
  const token = getToken(loginResponse);
  validateCartEmpty(token);
  betweenActionDelay();
}
