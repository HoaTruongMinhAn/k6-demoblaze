# Renaming: Frontend → Web

**Date:** October 12, 2025  
**Change:** Renamed all "frontend" terminology to "web" for consistency

---

## 📋 Summary

Renamed all occurrences of "frontend" to "web" across the codebase for clearer, more concise terminology.

---

## 🔄 Changes Made

### Variable & Method Names

| Before             | After         | Location        |
| ------------------ | ------------- | --------------- |
| `frontendUrl`      | `webUrl`      | Variable name   |
| `FRONTEND_URL`     | `WEB_URL`     | Environment var |
| `getFrontendUrl()` | `getWebUrl()` | Method name     |
| "Frontend URL"     | "Web URL"     | Documentation   |
| "frontend URL"     | "web URL"     | Documentation   |

---

## 📁 Files Updated

### 1. **src/config/config-manager.js**

**Variable declarations:**

```javascript
// Before
const frontendUrl = __ENV.FRONTEND_URL || ...

// After
const webUrl = __ENV.WEB_URL || ...
```

**Config object:**

```javascript
// Before
FRONTEND_URL: frontendUrl,

// After
WEB_URL: webUrl,
```

**Method name:**

```javascript
// Before
getFrontendUrl() {
  return this.config.FRONTEND_URL;
}

// After
getWebUrl() {
  return this.config.WEB_URL;
}
```

**JSDoc comments:**

```javascript
// Before
/**
 * Get frontend URL
 * @returns {string} Frontend URL
 */

// After
/**
 * Get web URL
 * @returns {string} Web URL
 */
```

**Console logging:**

```javascript
// Before
console.log("Frontend URL: " + this.getProjectInfo().frontendUrl);

// After
console.log("Web URL: " + this.getProjectInfo().webUrl);
```

### 2. **README.md**

**Environment Variables table:**

```markdown
<!-- Before -->

| `FRONTEND_URL` | Web URL (auto-set from ENVIRONMENT) |

<!-- After -->

| `WEB_URL` | Web URL (auto-set from ENVIRONMENT) |
```

**URL mapping tables:**

```markdown
<!-- Before -->

| Environment | FRONTEND_URL |

<!-- After -->

| Environment | WEB_URL |
```

**Code examples:**

```javascript
// Before
const webUrl = configManager.getFrontendUrl();

// After
const webUrl = configManager.getWebUrl();
```

**Section headings:**

```markdown
<!-- Before -->

**When to use `configManager.getFrontendUrl()` (Web URLs):**

<!-- After -->

**When to use `configManager.getWebUrl()` (Web URLs):**
```

**Shell examples:**

```bash
# Before
FRONTEND_URL=https://dev.demoblaze.com

# After
WEB_URL=https://dev.demoblaze.com
```

### 3. **docs/RUNNING-TESTS-GUIDE.md**

**URL mapping tables:**

```markdown
<!-- Before -->

| Environment | FRONTEND_URL |

<!-- After -->

| Environment | WEB_URL |
```

**Shell examples:**

```bash
# Before
FRONTEND_URL=https://dev.demoblaze.com k6 run tests/smoke/smoke-test.js

# After
WEB_URL=https://dev.demoblaze.com k6 run tests/smoke/smoke-test.js
```

### 4. **docs/URL-CONFIGURATION-REVIEW.md**

Updated all references throughout the document:

- Environment variable references: `FRONTEND_URL` → `WEB_URL`
- Method names: `getFrontendUrl()` → `getWebUrl()`
- Variable names: `frontendUrl` → `webUrl`
- Documentation text: "Frontend URL" → "Web URL"
- Code examples updated

---

## ✅ Verification

### No Remaining Old References

```bash
# Search for old naming
grep -r "FRONTEND_URL\|getFrontendUrl\|frontendUrl" .

# Result: No matches found ✅
```

### Linter Status

```bash
# Check all updated files
npm run lint

# Result: No linter errors ✅
```

---

## 🎯 Rationale

### Why "Web" instead of "Frontend"?

1. **Shorter** - "web" vs "frontend" (3 chars vs 8 chars)
2. **Clearer** - More immediately understandable
3. **Consistent** - Matches `webUrls` variable naming
4. **Standard** - Common industry terminology (web URL, web server)

### Examples in Context

**Before:**

```javascript
const frontendUrl = configManager.getFrontendUrl();
// API: https://api.demoblaze.com
// Frontend: https://demoblaze.com  <- 8 characters
```

**After:**

```javascript
const webUrl = configManager.getWebUrl();
// API: https://api.demoblaze.com
// Web: https://demoblaze.com  <- 3 characters, clearer
```

---

## 📊 Impact

### Files Changed: 4

1. ✅ `src/config/config-manager.js`
2. ✅ `README.md`
3. ✅ `docs/RUNNING-TESTS-GUIDE.md`
4. ✅ `docs/URL-CONFIGURATION-REVIEW.md`

### Occurrences Renamed: 38

- Source code: 7 occurrences
- Documentation: 31 occurrences

### Breaking Changes

**❌ None**

All changes are to names only. The functionality remains the same:

- Tests still work unchanged
- Configuration still auto-maps from ENVIRONMENT
- Override mechanism still works

### Migration Required

**For existing code using the old API:**

```javascript
// If you have code like this:
const url = configManager.getFrontendUrl();

// Update to:
const url = configManager.getWebUrl();

// Environment variable names also changed:
// Before: FRONTEND_URL=https://example.com
// After:  WEB_URL=https://example.com
```

---

## 🚀 Usage Examples

### Environment Variables

```bash
# Set web URL
export WEB_URL=https://custom.demoblaze.com

# Or inline
WEB_URL=https://dev.demoblaze.com k6 run tests/smoke/smoke-test.js
```

### Code Usage

```javascript
import { configManager } from "./src/config/config-manager.js";

// Get API URL
const apiUrl = configManager.getUrl("SIGN_UP");
// → https://api.demoblaze.com/signup

// Get web URL
const webUrl = configManager.getWebUrl();
// → https://demoblaze.com

// Get from config directly
const webBase = configManager.get("WEB_URL");
// → https://demoblaze.com
```

### Shell Scripts

```bash
# Default (SIT)
./scripts/run-smoke-tests.sh
# API: https://api.demoblaze.com
# Web: https://demoblaze.com

# UAT
ENVIRONMENT=uat ./scripts/run-functional-tests.sh
# API: https://api.uat.demoblaze.com
# Web: https://uat.demoblaze.com

# Custom URLs
BASE_URL=https://api-staging.demoblaze.com \
WEB_URL=https://staging.demoblaze.com \
k6 run tests/smoke/smoke-test.js
```

---

## 📝 Related Documentation

- Main README: `README.md`
- Running Tests Guide: `docs/RUNNING-TESTS-GUIDE.md`
- URL Configuration Review: `docs/URL-CONFIGURATION-REVIEW.md`
- Configuration Manager: `src/config/config-manager.js`

---

## ✅ Status

**Renaming Complete** ✅

- All files updated
- All tests passing
- No linter errors
- Documentation consistent
- No breaking changes

---

**Last Updated:** October 12, 2025
