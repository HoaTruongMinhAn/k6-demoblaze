import http from "k6/http";
import { check } from "k6";
import { configManager } from "../config-manager.js";

export default function () {
  const body = JSON.stringify({
    username: "tango_" + Date.now(),
    password: "MTIzNDU2", // raw value: 123456
  });

  const params = {
    headers: {
      "Content-Type": "application/json",
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
