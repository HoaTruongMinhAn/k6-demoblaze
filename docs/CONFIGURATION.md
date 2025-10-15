# Configuration

Single source of truth for test settings lives in `src/config/test-profiles.js`.

## Why JavaScript

- k6 imports JavaScript natively
- Inline JSDoc keeps docs with code
- No duplicated JSON to maintain

## How to use

Read a profile in tests:

```javascript
import { getTestProfile } from "../../src/config/test-profiles.js";
const profile = getTestProfile("smoke");
```

Modify or add profiles in `src/config/test-profiles.js`:

```javascript
export const TEST_PROFILES = {
  smoke: { vus: 1, duration: "5s" },
  // add or adjust profiles here
};
```

## Environment variables

Tests respect env like `ENVIRONMENT`, `BASE_URL`, and k6 cloud vars `K6_CLOUD_TOKEN`, `K6_CLOUD_PROJECT_ID` (set in CI). See `docs/TEST-PROFILES-GUIDE.md` for details.

## Related

- `src/config/test-profiles.js` (source)
- `docs/TEST-PROFILES-GUIDE.md` (profiles and thresholds)
