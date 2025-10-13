# Dynamic Distribution Guide

This guide explains how to use the new dynamic distribution system for mix scenarios in k6-demoblaze.

## Overview

The dynamic distribution system allows you to easily configure different user behavior patterns without hardcoding percentages. Instead of manually calculating VU distributions, you define scenarios with weights and let the system handle the math.

## How It Works

1. **Distribution Profiles**: Pre-defined patterns of user behavior with weighted scenarios
2. **Automatic Calculation**: VUs are automatically distributed based on scenario weights
3. **Environment Configuration**: Switch between profiles using environment variables
4. **Extensible**: Easy to add new scenarios and distribution profiles

## Available Distribution Profiles

### 1. `auth_basic` (Default)

Basic authentication flow - matches the original hardcoded distribution:

- **signup_only**: 20% (weight: 2)
- **login_only**: 20% (weight: 2)
- **signup_and_login**: 60% (weight: 6)

### 2. `ecommerce`

E-commerce focused with shopping behaviors:

- **signup_only**: 9% (weight: 1)
- **login_only**: 27% (weight: 3)
- **signup_and_login**: 36% (weight: 4)
- **add_to_cart**: 27% (weight: 3)
- **place_order**: 18% (weight: 2)

### 3. `high_conversion`

Optimized for purchase completion:

- **signup_only**: 7% (weight: 1)
- **login_only**: 13% (weight: 2)
- **signup_and_login**: 20% (weight: 3)
- **add_to_cart**: 27% (weight: 4)
- **place_order**: 33% (weight: 5)

### 4. `browse_heavy`

Users mostly browsing:

- **signup_only**: 27% (weight: 3)
- **login_only**: 36% (weight: 4)
- **signup_and_login**: 18% (weight: 2)
- **add_to_cart**: 9% (weight: 1)
- **place_order**: 9% (weight: 1)

### 5. `load_test`

Equal distribution for stress testing:

- **signup_only**: 20% (weight: 1)
- **login_only**: 20% (weight: 1)
- **signup_and_login**: 20% (weight: 1)
- **add_to_cart**: 20% (weight: 1)
- **place_order**: 20% (weight: 1)

## Usage

### Basic Usage

```bash
# Use default auth_basic profile
k6 run tests/mix/mix-scenario-weighted.js

# Use ecommerce profile
DISTRIBUTION_PROFILE=ecommerce k6 run tests/mix/mix-scenario-weighted.js

# Use high_conversion profile
DISTRIBUTION_PROFILE=high_conversion k6 run tests/mix/mix-scenario-weighted.js
```

### With Custom VUs and Duration

```bash
# Override VUs and duration while using specific distribution
DISTRIBUTION_PROFILE=ecommerce VUS=10 DURATION=30s k6 run tests/mix/mix-scenario-weighted.js
```

### In CI/CD Pipelines

```yaml
# Example GitHub Actions workflow
- name: Run E-commerce Load Test
  run: |
    DISTRIBUTION_PROFILE=ecommerce VUS=20 DURATION=60s k6 run tests/mix/mix-scenario-weighted.js
```

## Creating Custom Distribution Profiles

To add a new distribution profile, edit `src/config/test-profiles.js`:

```javascript
export const DISTRIBUTION_PROFILES = {
  // ... existing profiles ...

  /** Custom profile for your specific needs */
  custom_profile: {
    scenarios: {
      signup_only: {
        weight: 1,
        description: "New users who abandon after signup",
      },
      login_only: { weight: 2, description: "Returning users" },
      signup_and_login: {
        weight: 3,
        description: "New users completing full flow",
      },
      add_to_cart: { weight: 4, description: "Users adding items to cart" },
      place_order: { weight: 5, description: "Users completing purchases" },
      // Add more scenarios as needed
    },
  },
};
```

## Adding New Scenarios

When you add new functionality (like cart, orders, etc.), follow these steps:

1. **Add the scenario function** in `tests/mix/mix-scenario-weighted.js`:

```javascript
export function newScenario() {
  preActionDelay();
  // Your scenario logic here
  betweenActionDelay();
}
```

2. **Update distribution profiles** to include the new scenario:

```javascript
ecommerce: {
  scenarios: {
    // ... existing scenarios ...
    new_scenario: { weight: 2, description: "Description of new scenario" },
  },
},
```

3. **Test the new distribution**:

```bash
DISTRIBUTION_PROFILE=ecommerce k6 run tests/mix/mix-scenario-weighted.js
```

## Benefits

### 1. **No More Hardcoded Percentages**

- Easy to adjust user behavior patterns
- No manual VU calculations
- Clear, readable configuration

### 2. **Environment-Specific Testing**

- Different profiles for different test environments
- Easy A/B testing of user behavior patterns
- CI/CD friendly configuration

### 3. **Extensible and Maintainable**

- Add new scenarios without touching existing code
- Centralized configuration management
- Clear separation of concerns

### 4. **Realistic Load Testing**

- Model real user behavior patterns
- Test different business scenarios
- Validate system performance under various loads

## Migration from Hardcoded Distribution

The new system is backward compatible. Your existing tests will work with the default `auth_basic` profile, which matches the original 20/20/60 distribution.

To migrate:

1. No code changes needed for basic usage
2. Use `DISTRIBUTION_PROFILE` environment variable to try different patterns
3. Gradually adopt new scenarios as you implement them

## Troubleshooting

### Profile Not Found Error

```
Distribution profile "invalid_profile" not found. Available: auth_basic, ecommerce, high_conversion, browse_heavy, load_test
```

**Solution**: Use one of the available profile names or create a custom profile.

### VU Distribution Not Adding Up

The system automatically handles rounding to ensure VU totals match. The last scenario gets any remaining VUs to maintain the total.

### Scenario Function Not Found

If you reference a scenario in a distribution profile but haven't implemented the function, k6 will throw an error. Make sure to implement all referenced scenario functions.

## Examples

### Example 1: Testing E-commerce Load

```bash
# Test with realistic e-commerce user behavior
DISTRIBUTION_PROFILE=ecommerce VUS=50 DURATION=300s k6 run tests/mix/mix-scenario-weighted.js
```

### Example 2: Stress Testing All Scenarios

```bash
# Equal distribution for maximum stress
DISTRIBUTION_PROFILE=load_test VUS=100 DURATION=60s k6 run tests/mix/mix-scenario-weighted.js
```

### Example 3: High Conversion Testing

```bash
# Test system under high conversion scenario
DISTRIBUTION_PROFILE=high_conversion VUS=30 DURATION=120s k6 run tests/mix/mix-scenario-weighted.js
```

This dynamic distribution system makes your load testing more flexible, maintainable, and realistic while eliminating the need for manual VU calculations.
