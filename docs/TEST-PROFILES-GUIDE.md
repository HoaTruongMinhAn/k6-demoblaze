# Test Profiles Configuration Guide

## 📋 Overview

Tests dynamically load their configuration from **`src/config/test-profiles.js`**.

**This is the single source of truth** for all test configurations - no duplicate JSON files to maintain!

---

## 🎯 How It Works

### **1. Configuration File**

**Location**: `src/config/test-profiles.js`

```javascript
export const TEST_PROFILES = {
  smoke: {
    vus: 1,
    duration: "5s",
  },
  functional: {
    vus: 2,
    duration: "5s",
  },
  load: {
    vus: 10,
    duration: "5m",
  },
  stress: {
    vus: 50,
    duration: "10m",
  },
  spike: {
    vus: 100,
    duration: "2m",
  },
};
```

### **2. Using in Tests**

**Example**: `tests/smoke/smoke-test.js`

```javascript
import { getTestProfile } from "../../src/config/test-profiles.js";

// Load smoke test profile
const smokeProfile = getTestProfile("smoke");

export const options = {
  vus: smokeProfile.vus, // Gets 1 from profile
  duration: smokeProfile.duration, // Gets "5s" from profile
  // ... other options
};
```

---

## 📊 Available Test Profiles

| Profile        | VUs | Duration | Purpose                         |
| -------------- | --- | -------- | ------------------------------- |
| **smoke**      | 1   | 5s       | Quick validation - minimal load |
| **functional** | 2   | 5s       | Business workflow validation    |
| **load**       | 10  | 5m       | Expected production load        |
| **stress**     | 50  | 10m      | Beyond expected load            |
| **spike**      | 100 | 2m       | Sudden traffic spike            |

---

## ✏️ Modifying Test Profiles

Simply edit `src/config/test-profiles.js`:

```javascript
export const TEST_PROFILES = {
  smoke: {
    vus: 2, // Changed from 1
    duration: "10s", // Changed from "5s"
  },
  // ... other profiles
};
```

**Benefits:**

- ✅ Changes take effect immediately
- ✅ Type-safe and validated by k6
- ✅ Single source of truth (no sync issues!)
- ✅ Well-documented with JSDoc comments

---

## 🚀 Running Tests with Profiles

### **Using Profile Configuration**

```bash
# Runs with smoke profile (1 VU, 5s)
k6 run tests/smoke/smoke-test.js

# Runs with functional profile (2 VUs, 5s)
k6 run tests/functional/sign-up.js
```

### **Override Profile at Runtime**

You can override profile values with command-line flags:

```bash
# Override VUs and duration
k6 run --vus 5 --duration 30s tests/smoke/smoke-test.js

# Override via environment variables
VUS=10 DURATION=1m k6 run tests/smoke/smoke-test.js
```

**Priority Order (highest to lowest):**

1. Command-line flags (`--vus`, `--duration`)
2. Environment variables (`VUS`, `DURATION`)
3. Test profile configuration (from `test-profiles.js`)

---

## 📝 Creating New Test Profiles

### **Step 1: Add Profile to Configuration**

Edit `src/config/test-profiles.js`:

```javascript
export const TEST_PROFILES = {
  // ... existing profiles
  soak: {
    vus: 20,
    duration: "2h",
  },
};
```

### **Step 2: Use in Test**

Create or update your test:

```javascript
import { getTestProfile } from "../../src/config/test-profiles.js";

const soakProfile = getTestProfile("soak");

export const options = {
  vus: soakProfile.vus,
  duration: soakProfile.duration,
};
```

### **Step 3: Add JSDoc Comment**

Document your profile with a JSDoc comment:

```javascript
export const TEST_PROFILES = {
  // ... existing profiles

  /** Long-running stability test - Validates system under sustained load */
  soak: {
    vus: 20,
    duration: "2h",
  },
};
```

---

## 🌍 Environment Configuration

Similarly, environments are configured in `src/config/test-profiles.js`:

```javascript
export const ENVIRONMENTS = {
  dev: {
    baseUrl: "https://api-dev.demoblaze.com",
    timeout: "30s",
  },
  sit: {
    baseUrl: "https://api.demoblaze.com",
    timeout: "30s",
  },
  // ... other environments
};
```

### **Using Environment Configuration**

```javascript
import { getEnvironment } from "../../src/config/test-profiles.js";

const env = getEnvironment("uat");
console.log(env.baseUrl); // "https://api-uat.demoblaze.com"
```

---

## 💡 Best Practices

### **1. Document Your Profiles**

Use JSDoc comments to explain each profile:

```javascript
/** Brief description - What this profile is for */
profileName: {
  vus: 10,
  duration: "5m",
}
```

### **2. Profile Naming Convention**

- Use lowercase names: `smoke`, `load`, `stress`
- Be descriptive: `api_load`, `checkout_stress`
- Avoid special characters

### **3. Duration Guidelines**

| Test Type  | Recommended Duration |
| ---------- | -------------------- |
| Smoke      | 5s - 30s             |
| Functional | 30s - 2m             |
| Load       | 5m - 30m             |
| Stress     | 10m - 1h             |
| Soak       | 1h - 24h             |

### **4. VU Guidelines**

Start small and scale up:

1. **Smoke**: 1-2 VUs (just verify it works)
2. **Functional**: 2-5 VUs (validate workflows)
3. **Load**: 10-50 VUs (expected traffic)
4. **Stress**: 50-200 VUs (push limits)
5. **Spike**: 100-500 VUs (sudden burst)

---

## 🔍 Troubleshooting

### **Profile Not Found Error**

```
Error: Test profile "loadd" not found. Available: smoke, functional, load, stress, spike
```

**Solution:** Check spelling in `getTestProfile("loadd")` - should be `"load"`

### **Forgot Which File to Edit**

**Remember:** Only one file to edit - `src/config/test-profiles.js`

This is your single source of truth for all test configurations!

### **Want Different Profile Per Test**

```javascript
// In test file, specify which profile to use
const profile = getTestProfile("load"); // Use load profile
// OR
const profile = getTestProfile("stress"); // Use stress profile
```

---

## 📚 Examples

### **Example 1: Smoke Test with Profile**

```javascript
// tests/smoke/api-health.js
import { getTestProfile } from "../../src/config/test-profiles.js";

const profile = getTestProfile("smoke");

export const options = {
  vus: profile.vus,
  duration: profile.duration,
};

export default function () {
  // Your test logic
}
```

### **Example 2: Load Test with Custom Thresholds**

```javascript
// tests/load/checkout-load.js
import { getTestProfile } from "../../src/config/test-profiles.js";

const profile = getTestProfile("load");

export const options = {
  vus: profile.vus,
  duration: profile.duration,
  thresholds: {
    http_req_duration: ["p(95)<2000"],
    http_req_failed: ["rate<0.01"],
  },
};

export default function () {
  // Your test logic
}
```

### **Example 3: Multi-Stage Test**

```javascript
// tests/stress/ramp-up-test.js
import { getTestProfile } from "../../src/config/test-profiles.js";

const stressProfile = getTestProfile("stress");

export const options = {
  stages: [
    { duration: "2m", target: 10 },
    { duration: "5m", target: stressProfile.vus },
    { duration: "2m", target: 0 },
  ],
};

export default function () {
  // Your test logic
}
```

---

## 🎯 Summary

✅ **Single Source of Truth** - One file, no duplicates, no sync issues  
✅ **Easy to Modify** - Change VUs/duration for all tests at once  
✅ **Type-Safe** - k6 validates configuration at runtime  
✅ **Well-Documented** - JSDoc comments explain each profile  
✅ **Flexible** - Can override at runtime if needed

---

**Happy Testing! 🚀**
