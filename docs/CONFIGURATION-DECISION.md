# Configuration Architecture Decision

## 📋 Problem

**Initial Setup:** Test configuration existed in two places:

1. `src/config/test-profiles.js` (JavaScript - actually used by tests)
2. `data/test-config.json` (JSON - documentation only)

**Issues:**

- ❌ Redundancy - Same data in two files
- ❌ Sync burden - Must manually keep both updated
- ❌ Risk of inconsistency - Easy to update one but forget the other
- ❌ Confusion - Which file is the source of truth?

---

## 💡 Solution: Single Source of Truth

**Decision:** Use **ONLY** `src/config/test-profiles.js`

### Why JavaScript Over JSON?

| Factor              | JavaScript           | JSON             |
| ------------------- | -------------------- | ---------------- |
| **k6 Import**       | ✅ Native support    | ❌ Not supported |
| **Documentation**   | ✅ JSDoc comments    | ⚠️ Limited       |
| **Type Safety**     | ✅ k6 validates      | ⚠️ None          |
| **Flexibility**     | ✅ Can add functions | ❌ Data only     |
| **Maintainability** | ✅ Single file       | ❌ Requires sync |

---

## 🎯 Implementation

### File Structure

```javascript
// src/config/test-profiles.js

/** Quick validation - Minimal load to verify system is functional */
smoke: {
  vus: 1,
  duration: "5s",
}
```

### Documentation Strategy

Instead of separate JSON for documentation, we use:

1. **JSDoc Comments** - Inline documentation

```javascript
/** Description of what this profile does */
profileName: { ... }
```

2. **Comprehensive Guide** - `docs/TEST-PROFILES-GUIDE.md`
   - How profiles work
   - How to modify them
   - Best practices
   - Examples

---

## ✅ Benefits

### 1. No Redundancy

- ✅ One file to edit
- ✅ No sync issues
- ✅ No confusion

### 2. Better Documentation

- ✅ JSDoc comments right with the code
- ✅ IDE support (autocomplete, hover docs)
- ✅ Comprehensive external guide

### 3. Type Safety

- ✅ k6 validates structure at runtime
- ✅ Immediate error feedback
- ✅ IDE type checking (if configured)

### 4. Easier Maintenance

- ✅ Change once, applies everywhere
- ✅ No chance of forgetting to sync
- ✅ Clear single source of truth

---

## 📊 Before vs After

### Before: Dual Files (Redundant)

```
src/config/test-profiles.js  ← Used by tests
data/test-config.json        ← Documentation only
                             ⚠️ Must keep in sync!
```

**Workflow:**

1. Edit `test-profiles.js`
2. Remember to also edit `test-config.json`
3. Hope they stay in sync 🤞

### After: Single File (Clean)

```
src/config/test-profiles.js  ← Single source of truth
                             ✅ Well-documented with JSDoc
```

**Workflow:**

1. Edit `test-profiles.js`
2. Done! ✅

---

## 🔍 Real-World Example

### Old Way (Redundant)

**File 1:** `src/config/test-profiles.js`

```javascript
smoke: {
  vus: 1,
  duration: "5s",
}
```

**File 2:** `data/test-config.json`

```json
"smoke": {
  "vus": 1,
  "duration": "5s"
}
```

❌ **Problem:** Update one, forget the other → confusion!

### New Way (Single Source)

**File:** `src/config/test-profiles.js`

```javascript
/** Quick validation - Minimal load to verify system is functional */
smoke: {
  vus: 1,
  duration: "5s",
}
```

✅ **Solution:** Edit once, documented inline, no sync needed!

---

## 📝 How to Use

### Reading Configuration

```javascript
import { getTestProfile } from "../../src/config/test-profiles.js";

const profile = getTestProfile("smoke");
// Returns: { vus: 1, duration: "5s" }
```

### Modifying Configuration

Simply edit `src/config/test-profiles.js`:

```javascript
export const TEST_PROFILES = {
  smoke: {
    vus: 2, // Change here
    duration: "10s", // Changes apply immediately
  },
};
```

### Adding New Profiles

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

## 🎓 Lessons Learned

### 1. Avoid Duplication

> "Don't Repeat Yourself" (DRY) principle applies to configuration too!

### 2. Use Native Capabilities

> k6 imports JavaScript natively - why add complexity with JSON?

### 3. Document at Source

> JSDoc comments keep documentation close to the code

### 4. Simplicity Wins

> Fewer files = less to maintain = fewer errors

---

## 🚀 Migration Impact

### What Changed

- ✅ Removed `data/test-config.json`
- ✅ Enhanced `src/config/test-profiles.js` with JSDoc
- ✅ Updated guide documentation
- ✅ Tests still work perfectly

### What Stayed the Same

- ✅ Test files unchanged (same import)
- ✅ API unchanged (same functions)
- ✅ Behavior unchanged (same profiles)
- ✅ All tests passing

---

## 📚 Related Documentation

- **User Guide:** `docs/TEST-PROFILES-GUIDE.md`
- **Source File:** `src/config/test-profiles.js`
- **README:** `README.md` (updated references)

---

## ✅ Validation

Tests verified after migration:

```bash
# Smoke test
k6 run tests/smoke/smoke-test.js
# ✅ PASSED: 3 iterations, 100% checks passed

# Functional test
k6 run tests/functional/signup.js
# ✅ PASSED: 5 iterations, 100% checks passed
```

---

## 🎯 Recommendation for Other Teams

If you're building a k6 test framework:

1. **Start with JavaScript config** - Don't add JSON
2. **Use JSDoc comments** - Document inline
3. **Create external guides** - For comprehensive docs
4. **Avoid duplication** - One source of truth

**Why?** Less maintenance, fewer errors, clearer intent.

---

## 📊 Metrics

**Maintenance Burden Reduction:**

- Files to maintain: 2 → 1 (50% reduction)
- Sync points: 1 → 0 (eliminated risk)
- Lines of documentation: Increased (JSDoc + guide)
- Risk of inconsistency: Medium → Zero

**Team Benefits:**

- ✅ Faster onboarding (one file to learn)
- ✅ Fewer mistakes (no sync issues)
- ✅ Better IDE support (JSDoc hints)
- ✅ Clearer ownership (single source)

---

## 🎉 Conclusion

**Eliminating the redundant JSON configuration** was the right call:

- Simpler architecture
- Less maintenance
- No sync issues
- Better documentation
- Same functionality

**Status:** ✅ Successfully implemented and validated

---

_Last Updated: October 11, 2025_
