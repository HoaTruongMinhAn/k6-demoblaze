import http from "k6/http";
import { check } from "k6";
import { configManager } from "../config/config-manager.js";
import { CONSTANTS } from "../config/constants.js";
import { Product } from "../models/Product.js";
import {
  randomString,
  randomIntBetween,
} from "https://jslib.k6.io/k6-utils/1.2.0/index.js";

// Import test products data
const testProductsData = JSON.parse(open("../../data/product.json"));

export function addToCart(product, token) {
  if (!(product instanceof Product)) {
    throw new Error("addToCart requires a Product object");
  }

  const url = configManager.getApiUrl("ADD_TO_CART");
  const payload = JSON.stringify({
    id: randomString(10),
    cookie: token,
    prod_id: product.id,
    flag: true,
  });

  const params = {
    headers: {
      "Content-Type": CONSTANTS.CONTENT_TYPES.APPLICATION_JSON,
    },
  };

  return http.post(url, payload, params);
}

export function addToCartAndValidate(product, token, options = {}) {
  const { validateResponse = true, testName = "addToCart" } = options;

  if (!(product instanceof Product)) {
    throw new Error("addToCartAndValidate requires a Product object");
  }

  const response = addToCart(product, token);

  if (!validateResponse) {
    return { response, validationPassed: null };
  }

  const validationResults = check(response, {
    [`${testName} successful (status 200)`]: (r) =>
      r.status === CONSTANTS.HTTP_STATUS.OK,
    [`${testName} response is empty`]: (r) => r.body === "",
  });

  return { response, validationPassed: validationResults };
}

/**
 * Get an existing product from test data
 * @param {number|null} index - Specific product index (0-based), or null for random selection
 * @returns {Product} Product instance
 */
export function getExistingProduct(index = null) {
  const products = testProductsData.products;

  if (!products || products.length === 0) {
    throw new Error("No products found in test data");
  }

  // If index is provided, use it; otherwise pick randomly
  const productIndex =
    index !== null ? index : randomIntBetween(0, products.length - 1);
  const productData = products[productIndex];

  if (!productData) {
    throw new Error(`Product not found at index ${productIndex}`);
  }

  return Product.fromObject(productData);
}

/**
 * Get an existing product as a plain object (for backward compatibility)
 * @param {number|null} index - Specific product index (0-based), or null for random selection
 * @returns {Object} Product object with id, name, and desc
 */
export function getExistingProductObject(index = null) {
  const product = getExistingProduct(index);
  return product.toObject();
}

/**
 * Get all products from test data
 * @returns {Product[]} Array of Product instances
 */
export function getAllProducts() {
  const products = testProductsData.products;

  if (!products || products.length === 0) {
    throw new Error("No products found in test data");
  }

  return products.map((productData) => Product.fromObject(productData));
}
