import { randomString } from "https://jslib.k6.io/k6-utils/1.2.0/index.js";

/**
 * Product Model
 * Represents a product in the system with validation and utility methods
 */
export class Product {
  /**
   * Create a new Product instance
   * @param {number|string} id - The product ID
   * @param {string} name - The product name
   * @param {string} desc - The product description
   */
  constructor(id, name, desc) {
    this._id = this._validateId(id);
    this._name = this._validateName(name);
    this._desc = this._validateDesc(desc);
    this._createdAt = new Date().toISOString();
    this._isActive = true;
  }

  // Getters
  get id() {
    return this._id;
  }

  get name() {
    return this._name;
  }

  get desc() {
    return this._desc;
  }

  get createdAt() {
    return this._createdAt;
  }

  get isActive() {
    return this._isActive;
  }

  // Setters with validation
  set id(value) {
    this._id = this._validateId(value);
  }

  set name(value) {
    this._name = this._validateName(value);
  }

  set desc(value) {
    this._desc = this._validateDesc(value);
  }

  set isActive(value) {
    this._isActive = Boolean(value);
  }

  /**
   * Validate product ID
   * @param {number|string} id - ID to validate
   * @returns {number} Validated ID as number
   * @throws {Error} If ID is invalid
   */
  _validateId(id) {
    if (id === null || id === undefined) {
      throw new Error("Product ID cannot be null or undefined");
    }

    const numId = Number(id);
    if (isNaN(numId)) {
      throw new Error("Product ID must be a valid number");
    }

    if (numId <= 0) {
      throw new Error("Product ID must be a positive number");
    }

    return Math.floor(numId);
  }

  /**
   * Validate product name
   * @param {string} name - Name to validate
   * @returns {string} Validated name
   * @throws {Error} If name is invalid
   */
  _validateName(name) {
    if (!name || typeof name !== "string") {
      throw new Error("Product name must be a non-empty string");
    }
    if (name.trim().length < 1) {
      throw new Error("Product name cannot be empty");
    }
    if (name.length > 200) {
      throw new Error("Product name must be no more than 200 characters long");
    }
    return name.trim();
  }

  /**
   * Validate product description
   * @param {string} desc - Description to validate
   * @returns {string} Validated description
   * @throws {Error} If description is invalid
   */
  _validateDesc(desc) {
    if (!desc || typeof desc !== "string") {
      throw new Error("Product description must be a non-empty string");
    }
    if (desc.trim().length < 1) {
      throw new Error("Product description cannot be empty");
    }
    if (desc.length > 1000) {
      throw new Error(
        "Product description must be no more than 1000 characters long"
      );
    }
    return desc.trim();
  }

  /**
   * Get product data as a plain object (for API calls)
   * @returns {Object} Product data object
   */
  toObject() {
    return {
      id: this._id,
      name: this._name,
      desc: this._desc,
    };
  }

  /**
   * Get product data with all properties
   * @returns {Object} Complete product data object
   */
  toFullObject() {
    return {
      id: this._id,
      name: this._name,
      desc: this._desc,
      createdAt: this._createdAt,
      isActive: this._isActive,
    };
  }

  /**
   * Check if product name contains a specific term
   * @param {string} term - Term to search for
   * @returns {boolean} True if name contains term
   */
  nameContains(term) {
    return this._name.toLowerCase().includes(term.toLowerCase());
  }

  /**
   * Check if product description contains a specific term
   * @param {string} term - Term to search for
   * @returns {boolean} True if description contains term
   */
  descContains(term) {
    return this._desc.toLowerCase().includes(term.toLowerCase());
  }

  /**
   * Check if product matches search criteria
   * @param {string} searchTerm - Term to search for
   * @returns {boolean} True if product matches search
   */
  matchesSearch(searchTerm) {
    const term = searchTerm.toLowerCase();
    return this.nameContains(term) || this.descContains(term);
  }

  /**
   * Deactivate product
   */
  deactivate() {
    this._isActive = false;
  }

  /**
   * Activate product
   */
  activate() {
    this._isActive = true;
  }

  /**
   * Get a display name for the product
   * @returns {string} Display name
   */
  getDisplayName() {
    return `${this._name} (ID: ${this._id})`;
  }

  /**
   * Get a short description (first 100 characters)
   * @returns {string} Short description
   */
  getShortDesc() {
    return this._desc.length > 100
      ? this._desc.substring(0, 100) + "..."
      : this._desc;
  }

  /**
   * Create a Product from existing data object
   * @param {Object} productData - Product data object
   * @returns {Product} New Product instance
   */
  static fromObject(productData) {
    const { id, name, desc } = productData;
    return new Product(id, name, desc);
  }

  /**
   * Create a random product for testing
   * @param {number} id - Product ID (optional, will generate if not provided)
   * @param {string} namePrefix - Prefix for product name
   * @returns {Product} New random Product instance
   */
  static createRandom(id = null, namePrefix = "Test Product") {
    const productId = id || Math.floor(Math.random() * 10000) + 1;
    const name = `${namePrefix} ${randomString(6)}`;
    const desc = `This is a test product with random identifier ${randomString(
      8
    )}. It features various specifications and capabilities for testing purposes.`;
    return new Product(productId, name, desc);
  }

  /**
   * Create multiple random products
   * @param {number} count - Number of products to create
   * @param {string} namePrefix - Prefix for product names
   * @returns {Product[]} Array of Product instances
   */
  static createRandomBatch(count, namePrefix = "Test Product") {
    const products = [];
    for (let i = 0; i < count; i++) {
      products.push(Product.createRandom(null, namePrefix));
    }
    return products;
  }

  /**
   * Load products from JSON data
   * @param {Array} productsData - Array of product data objects
   * @returns {Product[]} Array of Product instances
   */
  static fromJsonArray(productsData) {
    if (!Array.isArray(productsData)) {
      throw new Error("Products data must be an array");
    }

    return productsData.map((productData) => Product.fromObject(productData));
  }

  /**
   * Filter products by search term
   * @param {Product[]} products - Array of products to filter
   * @param {string} searchTerm - Search term
   * @returns {Product[]} Filtered products
   */
  static filterBySearch(products, searchTerm) {
    return products.filter((product) => product.matchesSearch(searchTerm));
  }

  /**
   * Find product by ID
   * @param {Product[]} products - Array of products to search
   * @param {number|string} id - Product ID to find
   * @returns {Product|null} Found product or null
   */
  static findById(products, id) {
    const numId = Number(id);
    return products.find((product) => product.id === numId) || null;
  }

  /**
   * Find products by name pattern
   * @param {Product[]} products - Array of products to search
   * @param {string} namePattern - Name pattern to match
   * @returns {Product[]} Matching products
   */
  static findByNamePattern(products, namePattern) {
    return products.filter((product) => product.nameContains(namePattern));
  }

  /**
   * Validate product data object
   * @param {Object} productData - Product data to validate
   * @returns {boolean} True if valid
   */
  static isValidProductData(productData) {
    try {
      new Product(productData.id, productData.name, productData.desc);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get string representation of product
   * @returns {string} String representation
   */
  toString() {
    return `Product(${this._id}, ${this._name})`;
  }
}
