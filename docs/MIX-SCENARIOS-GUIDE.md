# Mix Scenarios Guide (Concise)

Use weighted scenarios to model realistic user behavior:

- 20% signup only
- 20% login only
- 60% signup → login

## Recommended approach (weighted) — `tests/mix/mix-scenario-weighted.js`

Key idea: multiple `constant-vus` scenarios with explicit VU shares and `exec` functions for each flow.

Why this:

- Simple and predictable
- Clear distribution control
- Works consistently across k6 versions

## How to run

Scripts (recommended for CI/CD):

```bash
./scripts/run-distribution-tests.sh cloud
./scripts/run-distribution-tests.sh local
```

Direct k6:

```bash
k6 run tests/mix/mix-scenario-weighted.js
DISTRIBUTION_PROFILE=ecommerce k6 cloud tests/mix/mix-scenario-weighted.js
```

## Tips

- Adjust VUs/duration via profiles in `src/config/test-profiles.js`
- Use scenario-specific thresholds if certain flows must be faster
- Prefer explicit weighting over shared-iterations for production

---

## Detailed example: Mix profile on ecommerce

Command:

```bash
TEST_PROFILE=mix DISTRIBUTION_PROFILE=ecommerce k6 cloud tests/mix/mix-scenario-weighted.js
```

What this does:

- Picks the test profile `mix` (VU/duration, thresholds) from `src/config/test-profiles.js`
- Picks the distribution profile `ecommerce` with six scenarios and weights:
  - signup_only (1)
  - login_only (3)
  - signup_and_login (4)
  - view_cart (2)
  - add_to_cart (3)
  - place_order (2)
- Executes on k6 Cloud (`k6 cloud`) and streams results using `K6_CLOUD_TOKEN`/`K6_CLOUD_PROJECT_ID`

Example derived options (illustrative):

```javascript
// from profiles, not exact values – check src/config/test-profiles.js
const mixProfile = { vus: 20, duration: "60s" };

export const options = {
  thresholds: {
    http_req_duration: ["p(95)<2000"],
  },
  scenarios: {
    signup_only: {
      executor: "constant-vus",
      exec: "signupOnly",
      vus: Math.ceil(mixProfile.vus * 0.2), // 20%
      duration: mixProfile.duration,
      tags: { scenario: "signup_only" },
    },
    login_only: {
      executor: "constant-vus",
      exec: "loginOnly",
      vus: Math.ceil(mixProfile.vus * 0.2), // 20%
      duration: mixProfile.duration,
      tags: { scenario: "login_only" },
    },
    signup_then_login: {
      executor: "constant-vus",
      exec: "signupThenLogin",
      vus: Math.ceil(mixProfile.vus * 0.6), // 60%
      duration: mixProfile.duration,
      tags: { scenario: "signup_then_login" },
    },
  },
};
```

Expected behavior (example with mix profile `vus=10`, total weight 15):

- VU split across six flows by weight (approx.):
  - signup_only ≈ 1/15 → 1 VU
  - login_only ≈ 3/15 → 2 VUs
  - signup_and_login ≈ 4/15 → 3 VUs
  - view_cart ≈ 2/15 → 1 VU
  - add_to_cart ≈ 3/15 → 2 VUs
  - place_order ≈ 2/15 → 1 VU
- Duration and thresholds come from the `mix` profile
- Results visible in Grafana k6 Cloud; console shows a cloud URL

Sample console (trimmed):

```text
scenarios: (100.00%) 6 scenarios, 10 max VUs, 40s max duration (incl. graceful stop):
  * add_to_cart: 2 looping VUs for 10s (exec: addToCart, gracefulStop: 30s)
  * login_only: 2 looping VUs for 10s (exec: loginOnly, gracefulStop: 30s)
  * place_order: 1 looping VUs for 10s (exec: placeOrder, gracefulStop: 30s)
  * signup_and_login: 3 looping VUs for 10s (exec: signupAndLogin, gracefulStop: 30s)
  * signup_only: 1 looping VUs for 10s (exec: signupOnly, gracefulStop: 30s)
  * view_cart: 1 looping VUs for 10s (exec: viewCart, gracefulStop: 30s)

INFO[0001] === Mix Scenario Test Setup (Dynamic Weighted) ===  source=console
INFO[0001] Test Profile: mix                             source=console
INFO[0001] Run Mode: cloud                               source=console
INFO[0001] Distribution Profile: ecommerce               source=console
INFO[0001] Total VUs: 10                                 source=console
INFO[0001] Duration: 10s                                 source=console
INFO[0001]                                               source=console
INFO[0001] VU Distribution:                              source=console
INFO[0001]   signup_only: 1 VUs (10.0%) - New users who abandon after signup  source=console
INFO[0001]   login_only: 2 VUs (20.0%) - Returning users  source=console
INFO[0001]   signup_and_login: 3 VUs (30.0%) - New users completing full flow  source=console
INFO[0001]   view_cart: 1 VUs (10.0%) - Users viewing their cart  source=console
INFO[0001]   add_to_cart: 2 VUs (20.0%) - Users adding items to cart  source=console
INFO[0001]   place_order: 1 VUs (10.0%) - Users completing purchases  source=console
INFO[0005] Added 4 products to cart                      source=console
INFO[0005] Added 4 products to cart                      source=console
INFO[0005] Added 5 products to cart                      source=console
INFO[0008] Added 3 products to cart                      source=console
INFO[0008] Added 3 products to cart                      source=console
INFO[0009] Added 1 products to cart                      source=console
INFO[0011] Added 2 products to cart                      source=console
INFO[0012] Added 3 products to cart                      source=console
INFO[0015] === Mix Scenario Test Complete ===            source=console

running (13.9s), 00/10 VUs, 28 complete and 0 interrupted iterations
add_to_cart      ✓ [======================================] 2 VUs  10s
login_only       ✓ [======================================] 2 VUs  10s
place_order      ✓ [======================================] 1 VUs  10s
signup_and_login ✓ [======================================] 3 VUs  10s
signup_only      ✓ [======================================] 1 VUs  10s
view_cart        ✓ [======================================] 1 VUs  10s

```
