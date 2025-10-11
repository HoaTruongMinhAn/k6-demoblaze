import http from "k6/http";
import { check } from "k6";

export default function () {
  const res = http.get("https://www.demoblaze.com/index.html");
  console.log("response status: " + res.status);

  check(res, {
    "status is 200": (r) => r.status === 200,
    "this is Product Store page": (r) =>
      r.body.includes("PRODUCT STORE") === true,
  });
}
