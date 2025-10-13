import { configManager } from "../../src/config/config-manager.js";
import { signUpAndValidate, loginAndValidate } from "../../src/api/auth-api.js";
import { getTestProfile } from "../../src/config/test-profiles.js";
import { preActionDelay, betweenActionDelay } from "../../src/utils/timing.js";
import {
  addToCartAndValidate,
  getExistingProduct,
} from "../../src/api/product-api.js";

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

  const res = loginAndValidate(user);
  const token = res.response.body
    .split("Auth_token: ")[1]
    .trim()
    .replace(/\\"/g, "")
    .replace(/\n/g, "")
    .replace(/"$/, "");
  console.log("Token: " + token);

  const product = getExistingProduct();
  addToCartAndValidate(product, token);
  console.log("Product: " + product.name);
  betweenActionDelay();
}
