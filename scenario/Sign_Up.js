import http from "k6/http";
import { check } from "k6";
import { configManager } from "../ConfigManager.js";
import { globalConstant } from "../GlobalConstant.js";

export default function () {
  const body = JSON.stringify({
    username: configManager.getTestOptions().username,
    password: configManager.getTestOptions().password,
  });

  const params = {
    headers: {
      "Content-Type": globalConstant.APPLICATION_JSON,
    },
  };

  const url = configManager.getUrl("SIGN_UP");
  console.log("Signup URL: " + url);

  const res = http.post(url, body, params);
  console.log("response status: " + res.status);

  check(res, {
    "status is 200": (r) => r.status === 200,
  });
}
