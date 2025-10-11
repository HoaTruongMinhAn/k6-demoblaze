import http from "k6/http";
import { check } from "k6";
import { configManager } from "../ConfigManager.js";

export default function () {
  console.log("Start test...");

  // Validate configuration
  configManager.validate();

  // Log configuration
  configManager.log();

  // Make a sample GET request to the Product Store page
  const res = http.get("https://www.demoblaze.com/index.html");
  console.log("response status: " + res.status);

  check(res, {
    "status is 200": (r) => r.status === 200,
    "this is Product Store page": (r) =>
      r.body.includes("PRODUCT STORE") === true,
  });
}
