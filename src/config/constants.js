/**
 * Global Constants
 * Centralized constants used across the entire test suite
 */

export const CONSTANTS = {
  CONTENT_TYPES: {
    APPLICATION_JSON: "application/json",
    APPLICATION_XML: "application/xml",
    TEXT_PLAIN: "text/plain",
    APPLICATION_FORM_URLENCODED: "application/x-www-form-urlencoded",
  },

  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    ACCEPTED: 202,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
    BAD_GATEWAY: 502,
    SERVICE_UNAVAILABLE: 503,
  },

  TEST_TYPES: {
    SMOKE: "smoke",
    LOAD: "load",
    STRESS: "stress",
    SPIKE: "spike",
    SOAK: "soak",
  },
};
