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
 * Add random products to cart with validation
 * @param {Object} loginResponse - Login response object with response property
 * @param {Object} options - Validation options
 * @param {boolean} options.validateResponse - Whether to validate response (default: true)
 * @param {string} options.testName - Test name for validation (default: "addToCart")
 * @param {number} options.minProducts - Minimum number of products to add (default: 1)
 * @param {number} options.maxProducts - Maximum number of products to add (default: 3)
 * @param {number|null} options.specificProductIndex - Specific product index, or null for random (default: null)
 * @returns {Object} Object with response and validation results
 */
export function addRandomProductsToCartAndValidate(token, options = {}) {
  const {
    validateResponse = true,
    testName = "addToCart",
    minProducts = 1,
    maxProducts = 5,
    specificProductIndex = null,
  } = options;

  // Determine number of products to add
  const numProducts = randomIntBetween(minProducts, maxProducts);

  // Get all available products
  const allProducts = getAllProducts();

  // Select random products (avoid duplicates if possible)
  const selectedProducts = [];
  const usedIndices = new Set();

  for (let i = 0; i < numProducts; i++) {
    let productIndex;

    if (specificProductIndex !== null) {
      // Use specific product if specified
      productIndex = specificProductIndex;
    } else {
      // Select random product (avoid duplicates if we have more products than needed)
      do {
        productIndex = randomIntBetween(0, allProducts.length - 1);
      } while (
        usedIndices.has(productIndex) &&
        usedIndices.size < allProducts.length
      );

      usedIndices.add(productIndex);
    }

    selectedProducts.push(allProducts[productIndex]);
  }

  // Add each product to cart and collect results
  const results = [];
  let allValidationsPassed = true;

  for (let i = 0; i < selectedProducts.length; i++) {
    const product = selectedProducts[i];
    const result = addToCartAndValidate(product, token, {
      validateResponse,
      testName: `${testName}_${i + 1}`,
    });

    results.push({
      product: product.name,
      result: result,
    });

    if (validateResponse && result.validationPassed === false) {
      allValidationsPassed = false;
    }
  }

  return {
    results,
    totalProducts: selectedProducts.length,
    allValidationsPassed,
    token,
  };
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

/**
 * Extract authentication token from login response
 * @param {Object} loginResponse - Login response object with response property
 * @returns {string} Extracted and cleaned authentication token
 */
export function getToken(loginResponse) {
  return loginResponse.response.body
    .split("Auth_token: ")[1]
    .trim()
    .replace(/\\"/g, "")
    .replace(/\n/g, "")
    .replace(/"$/, "");
}

export function viewCart(token) {
  const url = configManager.getApiUrl("VIEW_CART");
  const payload = JSON.stringify({
    cookie: token,
    flag: true,
  });

  const params = {
    headers: {
      "Content-Type": CONSTANTS.CONTENT_TYPES.APPLICATION_JSON,
    },
  };

  return http.post(url, payload, params);
}

export function validateCartHasProducts(token, options = {}) {
  const { validateResponse = true, testName = "viewCart" } = options;
  const response = viewCart(token);

  if (!validateResponse) {
    return { response, validationPassed: null };
  }

  const validationResults = check(response, {
    [`${testName} successful (status 200)`]: (r) =>
      r.status === CONSTANTS.HTTP_STATUS.OK,
    [`${testName} response has products`]: (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.Items && body.Items.length > 0;
      } catch (e) {
        return false;
      }
    },
  });

  return { response, validationPassed: validationResults };
}

export function validateCartEmpty(token, options = {}) {
  const { validateResponse = true, testName = "viewCart" } = options;
  const response = viewCart(token);

  if (!validateResponse) {
    return { response, validationPassed: null };
  }

  const validationResults = check(response, {
    [`${testName} successful (status 200)`]: (r) =>
      r.status === CONSTANTS.HTTP_STATUS.OK,
    [`${testName} response is empty`]: (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.Items && body.Items.length === 0;
      } catch (e) {
        return false;
      }
    },
  });

  return { response, validationPassed: validationResults };
}
