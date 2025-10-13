# Mix Scenarios Guide - K6 Expert Approaches

This guide explains how K6 experts set up mix scenarios with weighted distributions for realistic load testing.

## Overview

Mix scenarios simulate realistic user behavior patterns where different types of users perform different actions with different probabilities. This is essential for accurate load testing.

## Your Requirements

- **20%** users only sign up (new users who abandon)
- **20%** users only login (returning users)
- **60%** users sign up then login (new users completing flow)

## Three K6 Expert Approaches

### 1. Basic Scenario Approach (`mix-scenario.js`)

**Best for**: Simple scenarios, learning K6 basics

```javascript
export const options = {
  scenarios: {
    signup_only: {
      executor: "constant-vus",
      vus: Math.ceil(mixProfile.vus * 0.2), // 20% of VUs
      duration: mixProfile.duration,
    },
    login_only: {
      executor: "constant-vus",
      vus: Math.ceil(mixProfile.vus * 0.2), // 20% of VUs
      duration: mixProfile.duration,
    },
    signup_and_login: {
      executor: "constant-vus",
      vus: Math.ceil(mixProfile.vus * 0.6), // 60% of VUs
      duration: mixProfile.duration,
    },
  },
};
```

**Pros**: Simple, easy to understand
**Cons**: Manual VU calculation, less flexible

### 2. Weighted VUs Approach (`mix-scenario-weighted.js`) ⭐ **RECOMMENDED**

**Best for**: Most production scenarios, K6 experts' preferred method

```javascript
export const options = {
  scenarios: {
    signup_only: {
      executor: "constant-vus",
      exec: "signupOnly",
      vus: Math.ceil(mixProfile.vus * 0.2), // 20% of VUs
      duration: mixProfile.duration,
    },
    // ... other scenarios
  },
};
```

**Pros**:

- Simple and reliable
- Clear VU distribution
- Easy to understand and debug
- Works consistently across K6 versions
- Perfect for mix scenarios

**Cons**: Manual VU calculation (but this is actually clearer)

### 3. Shared Iterations Approach (`mix-scenario-shared-iterations.js`)

**Best for**: Educational purposes, understanding K6 internals

```javascript
export const options = {
  scenarios: {
    signup_only: {
      executor: "shared-iterations",
      exec: "signupOnly",
      iterations: 1, // 1 iteration for signup only
      maxDuration: mixProfile.duration,
    },
    // ... other scenarios
  },
  vus: mixProfile.vus, // VUs shared across all scenarios
};
```

**Pros**:

- VUs are shared across scenarios
- More efficient resource utilization
- Educational for understanding K6

**Cons**:

- More complex configuration
- Can have timing issues
- Less predictable execution
- Not recommended for production mix scenarios

### 4. Advanced Ramping Approach (`mix-scenario-advanced.js`)

**Best for**: Production load testing, realistic traffic patterns

```javascript
export const options = {
  scenarios: {
    new_users_exploring: {
      executor: "ramping-vus",
      exec: "signupOnly",
      startVUs: 0,
      stages: [
        { duration: "5s", target: Math.ceil(mixProfile.vus * 0.1) },
        { duration: "10s", target: Math.ceil(mixProfile.vus * 0.2) },
        { duration: "15s", target: Math.ceil(mixProfile.vus * 0.2) },
      ],
    },
    // ... other scenarios with different patterns
  },
};
```

**Pros**:

- Most realistic traffic patterns
- Different ramp-up patterns per user type
- Advanced threshold configuration
- Production-ready

**Cons**: Most complex to set up

## Running the Tests

### Using the Script

```bash
# Run basic mix scenario
./scripts/run-mix-tests.sh

# Run with custom parameters
VUS=20 DURATION=60s ./scripts/run-mix-tests.sh

# Run specific environment
ENVIRONMENT=uat ./scripts/run-mix-tests.sh
```

### Direct K6 Commands

```bash
# Basic approach
k6 run tests/mix/mix-scenario.js

# Weighted approach (recommended)
k6 run tests/mix/mix-scenario-weighted.js

# Advanced approach
k6 run tests/mix/mix-scenario-advanced.js
```

## K6 Scenario Executors Explained

### `constant-vus`

- Maintains constant number of VUs
- Good for steady-state testing
- Simple to understand

### `shared-iterations`

- Distributes iterations across VUs
- More realistic user behavior
- Better resource utilization
- **K6 experts' preferred for mix scenarios**

### `ramping-vus`

- Gradually increases VUs over time
- Simulates realistic traffic patterns
- Different stages for different behaviors
- **Best for production load testing**

## Advanced Features Used

### 1. Scenario Tags

```javascript
tags: {
  scenario: "signup_only",
  user_type: "explorer"
}
```

- Enables scenario-specific thresholds
- Better monitoring and reporting
- Easier debugging

### 2. Advanced Thresholds

```javascript
thresholds: {
  // Global thresholds
  http_req_duration: ["p(95)<2000"],

  // Scenario-specific thresholds
  "http_req_duration{scenario:signup_only}": ["p(95)<1500"],
  "http_req_duration{user_type:returning}": ["p(95)<1000"],
}
```

### 3. Ramping Patterns

```javascript
stages: [
  { duration: "5s", target: 2 }, // Ramp up
  { duration: "10s", target: 5 }, // Peak load
  { duration: "5s", target: 0 }, // Ramp down
];
```

## Best Practices

### 1. Start Simple

- Begin with basic approach
- Understand your traffic patterns
- Gradually add complexity

### 2. Use Realistic Data

- Different user types need different data
- Use existing users for login scenarios
- Generate new users for signup scenarios

### 3. Monitor Scenario Distribution

```javascript
export function setup() {
  console.log(`Signup Only: ${Math.ceil(mixProfile.vus * 0.2)} (20%)`);
  console.log(`Login Only: ${Math.ceil(mixProfile.vus * 0.2)} (20%)`);
  console.log(`Signup + Login: ${Math.ceil(mixProfile.vus * 0.6)} (60%)`);
}
```

### 4. Set Appropriate Thresholds

- Different scenarios may have different performance expectations
- Login-only should be faster than signup+login
- Use scenario-specific thresholds

### 5. Test Different Load Patterns

- Ramp-up patterns
- Steady-state patterns
- Spike patterns
- Gradual ramp-down

## Monitoring and Analysis

### Key Metrics to Watch

- **Response times by scenario**: Are different user flows performing differently?
- **Error rates by scenario**: Which user flows are failing?
- **Throughput by scenario**: How many users of each type are being processed?

### K6 Output Analysis

```bash
# Generate detailed report
k6 run --out json=results.json tests/mix/mix-scenario-weighted.js

# View scenario breakdown
k6 run --out csv=results.csv tests/mix/mix-scenario-weighted.js
```

## Recommended Approach

For most production scenarios, K6 experts recommend:

1. **Start with weighted iterations** (`mix-scenario-weighted.js`)
2. **Add ramping patterns** for realistic traffic simulation
3. **Use scenario-specific thresholds** for better monitoring
4. **Monitor scenario distribution** to ensure correct weighting

This approach provides the best balance of realism, maintainability, and performance insights.
