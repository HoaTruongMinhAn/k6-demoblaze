import { randomString } from "https://jslib.k6.io/k6-utils/1.2.0/index.js";

/**
 * User Model
 * Represents a user in the system with validation and utility methods
 */
export class User {
  /**
   * Create a new User instance
   * @param {string} username - The username
   * @param {string} password - The password
   * @param {string} category - User category (e.g., 'customer', 'admin')
   */
  constructor(username, password, category = "customer") {
    this._username = this._validateUsername(username);
    this._password = this._validatePassword(password);
    this._category = this._validateCategory(category);
    this._createdAt = new Date().toISOString();
    this._isActive = true;
  }

  // Getters
  get username() {
    return this._username;
  }

  get password() {
    return this._password;
  }

  get category() {
    return this._category;
  }

  get createdAt() {
    return this._createdAt;
  }

  get isActive() {
    return this._isActive;
  }

  // Setters with validation
  set username(value) {
    this._username = this._validateUsername(value);
  }

  set password(value) {
    this._password = this._validatePassword(value);
  }

  set category(value) {
    this._category = this._validateCategory(value);
  }

  set isActive(value) {
    this._isActive = Boolean(value);
  }

  /**
   * Validate username
   * @param {string} username - Username to validate
   * @returns {string} Validated username
   * @throws {Error} If username is invalid
   */
  _validateUsername(username) {
    if (!username || typeof username !== "string") {
      throw new Error("Username must be a non-empty string");
    }
    if (username.length < 3) {
      throw new Error("Username must be at least 3 characters long");
    }
    if (username.length > 50) {
      throw new Error("Username must be no more than 50 characters long");
    }
    return username.trim();
  }

  /**
   * Validate password
   * @param {string} password - Password to validate
   * @returns {string} Validated password
   * @throws {Error} If password is invalid
   */
  _validatePassword(password) {
    if (!password || typeof password !== "string") {
      throw new Error("Password must be a non-empty string");
    }
    if (password.length < 1) {
      throw new Error("Password cannot be empty");
    }
    return password;
  }

  /**
   * Validate category
   * @param {string} category - Category to validate
   * @returns {string} Validated category
   * @throws {Error} If category is invalid
   */
  _validateCategory(category) {
    const validCategories = ["customer", "admin", "guest"];
    if (!validCategories.includes(category)) {
      throw new Error(`Category must be one of: ${validCategories.join(", ")}`);
    }
    return category;
  }

  /**
   * Get user data as a plain object (for API calls)
   * @returns {Object} User data object
   */
  toObject() {
    return {
      username: this._username,
      password: this._password,
    };
  }

  /**
   * Get user data with all properties
   * @returns {Object} Complete user data object
   */
  toFullObject() {
    return {
      username: this._username,
      password: this._password,
      category: this._category,
      createdAt: this._createdAt,
      isActive: this._isActive,
    };
  }

  /**
   * Check if user is of a specific category
   * @param {string} category - Category to check
   * @returns {boolean} True if user belongs to category
   */
  isCategory(category) {
    return this._category === category;
  }

  /**
   * Check if user is admin
   * @returns {boolean} True if user is admin
   */
  isAdmin() {
    return this.isCategory("admin");
  }

  /**
   * Check if user is customer
   * @returns {boolean} True if user is customer
   */
  isCustomer() {
    return this.isCategory("customer");
  }

  /**
   * Deactivate user
   */
  deactivate() {
    this._isActive = false;
  }

  /**
   * Activate user
   */
  activate() {
    this._isActive = true;
  }

  /**
   * Get a display name for the user
   * @returns {string} Display name
   */
  getDisplayName() {
    return `${this._username} (${this._category})`;
  }

  /**
   * Create a User from existing data object
   * @param {Object} userData - User data object
   * @returns {User} New User instance
   */
  static fromObject(userData) {
    const { username, password, category = "customer" } = userData;
    return new User(username, password, category);
  }

  /**
   * Create a random user for testing
   * @param {string} category - User category
   * @param {string} usernamePrefix - Prefix for username
   * @returns {User} New random User instance
   */
  static createRandom(category = "customer", usernamePrefix = "test_") {
    const username = `${usernamePrefix}${randomString(8)}_${Date.now()}`;
    const password = "MTIzNDU2"; // Default test password
    return new User(username, password, category);
  }

  /**
   * Create multiple random users
   * @param {number} count - Number of users to create
   * @param {string} category - User category
   * @param {string} usernamePrefix - Prefix for username
   * @returns {User[]} Array of User instances
   */
  static createRandomBatch(
    count,
    category = "customer",
    usernamePrefix = "test_"
  ) {
    const users = [];
    for (let i = 0; i < count; i++) {
      users.push(User.createRandom(category, usernamePrefix));
    }
    return users;
  }

  /**
   * Validate user data object
   * @param {Object} userData - User data to validate
   * @returns {boolean} True if valid
   */
  static isValidUserData(userData) {
    try {
      new User(userData.username, userData.password, userData.category);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get string representation of user
   * @returns {string} String representation
   */
  toString() {
    return `User(${this._username}, ${this._category})`;
  }
}
