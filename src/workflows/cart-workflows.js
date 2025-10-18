import { configManager } from "../config/config-manager.js";
import { signUpAndValidate, loginAndValidate } from "../api/auth-api.js";
import {
  addRandomProductsToCartAndValidate,
  validateCartHasProducts,
  validateCartEmpty,
  getToken,
} from "../api/product-api.js";
import { preActionDelay, betweenActionDelay } from "../utils/timing.js";

/**
 * Cart Workflows
 * Reusable shopping cart scenarios following SRP
 * These workflows can be used across different test files
 */

/**
 * Add items to cart workflow
 * Creates user, logs in, and adds random products to cart
 * @returns {Object} Contains user, token, and cart result
 */
export function addItemsWorkflow() {
  preActionDelay();
  const user = configManager.generateUserInfo("customer");
  signUpAndValidate(user);

  const loginResponse = loginAndValidate(user);
  const token = getToken(loginResponse);

  const cartResult = addRandomProductsToCartAndValidate(token);
  console.log(`Added ${cartResult.totalProducts} products to cart`);

  betweenActionDelay();
  return { user, token, cartResult };
}

/**
 * View cart workflow
 * Creates user, logs in, and validates empty cart
 * @returns {Object} Contains user and token
 */
export function viewCartWorkflow() {
  preActionDelay();
  const user = configManager.generateUserInfo("customer");
  signUpAndValidate(user);

  const loginResponse = loginAndValidate(user);
  const token = getToken(loginResponse);
  validateCartEmpty(token);

  betweenActionDelay();
  return { user, token };
}

/**
 * Place order workflow (full cart flow)
 * Creates user, logs in, validates empty cart, adds items, and validates cart has products
 * @returns {Object} Contains user, token, and cart result
 */
export function placeOrderWorkflow() {
  preActionDelay();
  const user = configManager.generateUserInfo("customer");
  signUpAndValidate(user);

  const loginResponse = loginAndValidate(user);
  const token = getToken(loginResponse);

  // Check empty cart first
  validateCartEmpty(token);

  // Add items to cart
  const cartResult = addRandomProductsToCartAndValidate(token);
  console.log(`Added ${cartResult.totalProducts} products to cart`);

  // Verify cart has products
  validateCartHasProducts(token);

  betweenActionDelay();
  return { user, token, cartResult };
}
