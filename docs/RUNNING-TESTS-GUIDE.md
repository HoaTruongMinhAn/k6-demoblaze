# Running Tests Guide

Complete guide on how to run k6 tests in this project, including Jenkins pipeline integration.

## 🚀 **Jenkins Pipeline Integration**

This project is designed to work seamlessly with Jenkins CI/CD pipelines. The test execution follows a sequential pipeline structure:

### **Pipeline Execution Sequence**

```
01 - product SIT (if success)
    ↓
02 - smoke performance test (if success)
    ↓
03 - functional performance test (if success)
    ↓
04 - mix performance test
```

### **Jenkins Pipeline Stages**

| Stage  | Test Type              | Purpose                    | Command                                                    |
| ------ | ---------------------- | -------------------------- | ---------------------------------------------------------- |
| **01** | Product SIT            | System Integration Testing | `./scripts/run-smoke-tests.sh cloud`                       |
| **02** | Smoke Performance      | Critical path validation   | `./scripts/run-smoke-tests.sh cloud load`                  |
| **03** | Functional Performance | Business workflow testing  | `./scripts/run-functional-tests.sh cloud load`             |
| **04** | Mix Performance        | Realistic user behavior    | `./scripts/run-distribution-tests.sh cloud ecommerce load` |

### **Pipeline Configuration**

Each stage uses **cloud mode** for optimal performance and centralized reporting:

```bash
# Stage 01: Product SIT (Basic validation)
./scripts/run-smoke-tests.sh cloud

# Stage 02: Smoke Performance (Load testing)
./scripts/run-smoke-tests.sh cloud load

# Stage 03: Functional Performance (Business workflows)
./scripts/run-functional-tests.sh cloud load

# Stage 04: Mix Performance (Realistic scenarios)
./scripts/run-distribution-tests.sh cloud ecommerce load
```

### **Pipeline Benefits**

- ✅ **Sequential Execution**: Each stage runs only if previous stage succeeds
- ✅ **Cloud Infrastructure**: All tests run on k6 cloud for consistent performance
- ✅ **Centralized Reporting**: All results available in k6 cloud dashboard
- ✅ **Fail-Fast**: Pipeline stops on first failure, saving time and resources
- ✅ **Scalable**: Easy to add more stages or modify existing ones

---

## 🔍 **Understanding File Types**

### **Shell Scripts (`.sh`)** - Automation Wrappers

Located in `scripts/` directory:

- `run-smoke-tests.sh`
- `run-functional-tests.sh`
- `run-distribution-tests.sh` ⭐ (Enhanced mix tests with dynamic profiles)
- `run-all-tests.sh`
- `clean-reports.sh`

**What they do:**

- Run k6 internally
- Generate reports
- Handle exit codes
- Provide formatted output

**How to run:**

```bash
./scripts/run-smoke-tests.sh
```

### **K6 Test Files (`.js`)** - Actual Tests

Located in `tests/` directory:

- `tests/smoke/smoke-test.js`
- `tests/functional/auth/signup.js`
- `tests/mix/mix-scenario-weighted.js`

**What they do:**

- Contain test logic
- Make HTTP requests
- Validate responses

**How to run:**

```bash
k6 run tests/smoke/smoke-test.js
k6 run tests/mix/mix-scenario-weighted.js
```

---

## ✅ **Method 1: Using Shell Scripts** (Recommended for CI/CD)

### **Run Smoke Tests**

```bash
# Local mode - runs locally and streams to cloud with smoke profile
./scripts/run-smoke-tests.sh local

# Cloud mode (default) - runs on k6 cloud infrastructure with smoke profile
./scripts/run-smoke-tests.sh
./scripts/run-smoke-tests.sh cloud

# Cloud mode with specific test profile
./scripts/run-smoke-tests.sh cloud load
./scripts/run-smoke-tests.sh cloud stress

# Local mode with specific test profile
./scripts/run-smoke-tests.sh local functional
./scripts/run-smoke-tests.sh local spike
```

**What it does:**

- ✅ Runs smoke test
- ✅ **Cloud mode**: Runs directly on k6 cloud infrastructure
- ✅ **Local mode**: Runs locally, streams to cloud, generates JSON reports in `reports/`
- ✅ Exports summary
- ✅ Shows pass/fail status
- ✅ Returns proper exit code

**Output:**

```
======================================
Running Smoke Tests
======================================
... k6 test output ...
======================================
✅ Smoke Tests PASSED
======================================
```

### **Run Functional Tests**

```bash
# Cloud mode (default) with functional profile
./scripts/run-functional-tests.sh
./scripts/run-functional-tests.sh cloud

# Local mode with functional profile
./scripts/run-functional-tests.sh local

# Cloud mode with specific test profile
./scripts/run-functional-tests.sh cloud load
./scripts/run-functional-tests.sh cloud stress

# Local mode with specific test profile
./scripts/run-functional-tests.sh local smoke
./scripts/run-functional-tests.sh local spike
```

**What it does:**

- ✅ Runs all tests in `tests/functional/`
- ✅ **Cloud mode**: Runs directly on k6 cloud infrastructure
- ✅ **Local mode**: Generates reports for each test, streams to cloud
- ✅ Stops on first failure
- ✅ Shows summary at end

### **Run Mix Scenario Tests (Enhanced)**

```bash
# Cloud mode (default) - runs on k6 cloud infrastructure
./scripts/run-distribution-tests.sh
./scripts/run-distribution-tests.sh cloud

# Local mode - runs locally and streams to cloud
./scripts/run-distribution-tests.sh local

# Run specific profile
./scripts/run-distribution-tests.sh cloud ecommerce
./scripts/run-distribution-tests.sh local ecommerce
```

**Direct k6 execution (mix-scenario-weighted.js):**

```bash
# Local mode entirely
DISTRIBUTION_PROFILE=ecommerce k6 run tests/mix/mix-scenario-weighted.js

# Local mode with mix profile
DISTRIBUTION_PROFILE=ecommerce k6 run -o cloud tests/mix/mix-scenario-weighted.js

# Cloud mode (default) with mix profile
DISTRIBUTION_PROFILE=ecommerce k6 cloud tests/mix/mix-scenario-weighted.js

# Cloud mode with specific test profile
TEST_PROFILE=load DISTRIBUTION_PROFILE=ecommerce k6 cloud tests/mix/mix-scenario-weighted.js
TEST_PROFILE=stress DISTRIBUTION_PROFILE=ecommerce k6 cloud tests/mix/mix-scenario-weighted.js

# Local mode with specific test profile
TEST_PROFILE=functional DISTRIBUTION_PROFILE=ecommerce k6 run -o cloud tests/mix/mix-scenario-weighted.js
TEST_PROFILE=spike DISTRIBUTION_PROFILE=ecommerce k6 run -o cloud tests/mix/mix-scenario-weighted.js

# With run mode environment variable
RUN_MODE=cloud TEST_PROFILE=load DISTRIBUTION_PROFILE=ecommerce k6 cloud tests/mix/mix-scenario-weighted.js
RUN_MODE=local TEST_PROFILE=stress DISTRIBUTION_PROFILE=ecommerce k6 run -o cloud tests/mix/mix-scenario-weighted.js
```

**What it does:**

- ✅ Runs realistic user behavior simulation with **dynamic distribution profiles**
- ✅ **5 pre-configured profiles**: auth_basic, ecommerce, high_conversion, browse_heavy, load_test
- ✅ **Cloud mode**: Runs directly on k6 cloud infrastructure
- ✅ **Local mode**: Generates detailed reports with JSON output, streams to cloud
- ✅ Shows comprehensive summary with jq
- ✅ Supports multiple test file types
- ✅ Environment variable configuration

**Available distribution profiles:**

```bash
# Run all profiles (cloud mode)
./scripts/run-distribution-tests.sh
./scripts/run-distribution-tests.sh cloud

# Run all profiles (local mode)
./scripts/run-distribution-tests.sh local

# Run specific profile
./scripts/run-distribution-tests.sh cloud ecommerce
./scripts/run-distribution-tests.sh local ecommerce

# Different test approaches
TEST_FILE=basic ./scripts/run-distribution-tests.sh local auth_basic
TEST_FILE=advanced ./scripts/run-distribution-tests.sh cloud ecommerce

# With custom parameters
VUS=20 DURATION=60s ./scripts/run-distribution-tests.sh cloud
ENVIRONMENT=uat OUTPUT_DIR=custom-reports ./scripts/run-distribution-tests.sh local
```

**Distribution Profiles Explained:**

- **`auth_basic`**: Basic authentication flow (20% signup, 20% login, 60% signup+login)
- **`ecommerce`**: E-commerce focused with shopping behaviors
- **`high_conversion`**: Optimized for purchase completion
- **`browse_heavy`**: Users mostly browsing
- **`load_test`**: Equal distribution for stress testing

**Mix Scenario Approaches Explained:**

- **`weighted` (default)**: Uses `constant-vus` executor - K6 expert's recommended approach
- **`basic`**: Simple approach with `constant-vus` executor - good for learning
- **`advanced`**: Uses ramping patterns with different user behaviors - production load testing
- **`shared-iterations`**: Educational approach using `shared-iterations` executor

**Example output:**

```
=== Mix Scenario Test Runner ===
Environment: sit
Output Directory: reports
Test File: weighted
Using: Weighted Distribution (Recommended)

=== Test Summary ===
{
  "Total Requests": 16,
  "Failed Requests": 0,
  "Average Response Time (ms)": 277,
  "90th Percentile (ms)": 298,
  "95th Percentile (ms)": 308,
  "Max Response Time (ms)": 326,
  "Checks Pass Rate (%)": 100,
  "Total Iterations": 8,
  "Max VUs": 5
}

=== Mix Scenario Distribution ===
20% Signup Only (new users who abandon)
20% Login Only (returning users)
60% Signup + Login (new users completing flow)
```

### **Run All Tests (Jenkins Pipeline Simulation)**

```bash
# Cloud mode (default) - simulates Jenkins pipeline sequence
./scripts/run-all-tests.sh
./scripts/run-all-tests.sh cloud

# Local mode - runs locally with cloud streaming
./scripts/run-all-tests.sh local

# Cloud mode with specific test profile (applied to all test types)
./scripts/run-all-tests.sh cloud load
./scripts/run-all-tests.sh cloud stress

# Local mode with specific test profile (applied to all test types)
./scripts/run-all-tests.sh local smoke
./scripts/run-all-tests.sh local spike

# Cloud mode with mix test profile
./scripts/run-all-tests.sh cloud mix
```

**What it does (Jenkins Pipeline Sequence):**

- ✅ **Stage 01**: Runs smoke tests (Product SIT validation)
- ✅ **Stage 02**: If smoke passes, runs smoke tests with load profile (Smoke Performance)
- ✅ **Stage 03**: If stage 02 passes, runs functional tests with load profile (Functional Performance)
- ✅ **Stage 04**: If stage 03 passes, runs distribution tests with ecommerce profile (Mix Performance)
- ✅ **Cloud mode**: All tests run on k6 cloud infrastructure (Jenkins default)
- ✅ **Local mode**: All tests run locally, stream to cloud, generate reports
- ✅ Shows total duration and stage-by-stage progress
- ✅ Comprehensive reporting with stage results
- ✅ **Fail-Fast**: Stops on first stage failure (matches Jenkins behavior)

**Example output (Jenkins Pipeline Simulation):**

```
==========================================
K6 Test Suite - Jenkins Pipeline Simulation - Mode: cloud
==========================================

Stage 01: Product SIT (Basic Validation)...
✅ Product SIT tests passed

Stage 02: Smoke Performance (Load Testing)...
✅ Smoke performance tests passed

Stage 03: Functional Performance (Business Workflows)...
✅ Functional performance tests passed

Stage 04: Mix Performance (Realistic Scenarios)...
✅ Mix performance tests passed

==========================================
✅ All Pipeline Stages Completed Successfully
==========================================
Total Duration: 2m 15s
Pipeline Status: PASSED
Reports available in k6 cloud dashboard
==========================================
```

### **Clean Reports**

```bash
./scripts/clean-reports.sh
```

Removes all generated test reports.

---

## 🔧 **Jenkins Pipeline Configuration**

### **Jenkinsfile Example**

```groovy
pipeline {
    agent any

    stages {
        stage('01 - Product SIT') {
            steps {
                sh './scripts/run-smoke-tests.sh cloud'
            }
        }

        stage('02 - Smoke Performance Test') {
            steps {
                sh './scripts/run-smoke-tests.sh cloud load'
            }
        }

        stage('03 - Functional Performance Test') {
            steps {
                sh './scripts/run-functional-tests.sh cloud load'
            }
        }

        stage('04 - Mix Performance Test') {
            steps {
                sh './scripts/run-distribution-tests.sh cloud ecommerce load'
            }
        }
    }

    post {
        always {
            // Archive test results
            archiveArtifacts artifacts: 'reports/*.json', allowEmptyArchive: true
        }
        success {
            echo 'All pipeline stages completed successfully!'
        }
        failure {
            echo 'Pipeline failed at one of the stages.'
        }
    }
}
```

### **Jenkins Pipeline Benefits**

- ✅ **Sequential Execution**: Each stage runs only if previous succeeds
- ✅ **Cloud Infrastructure**: Consistent test environment across all stages
- ✅ **Centralized Reporting**: All results in k6 cloud dashboard
- ✅ **Fail-Fast Strategy**: Stops on first failure to save resources
- ✅ **Artifact Archiving**: Test reports saved for analysis
- ✅ **Status Notifications**: Clear success/failure indicators

### **Environment Variables for Jenkins**

```bash
# Set in Jenkins environment or .env file
export ENVIRONMENT=sit          # or uat, prod
export K6_CLOUD_TOKEN=your_token
export VUS=10                   # Override default VUs
export DURATION=60s             # Override default duration
```

---

## ⚡ **Method 2: Direct K6 Commands** (Quick Testing)

### **Run Specific Test**

```bash
# Smoke test (default smoke profile)
k6 run tests/smoke/smoke-test.js

# Smoke test with specific profile
TEST_PROFILE=load k6 run tests/smoke/smoke-test.js
TEST_PROFILE=stress k6 run tests/smoke/smoke-test.js

# Smoke test with cloud output
k6 run -o cloud tests/smoke/smoke-test.js
TEST_PROFILE=functional k6 run -o cloud tests/smoke/smoke-test.js

# Functional test (default functional profile)
k6 run tests/functional/auth/signup.js

# Functional test with specific profile
TEST_PROFILE=load k6 run tests/functional/auth/signup.js
TEST_PROFILE=stress k6 run tests/functional/auth/signup.js

# Functional test with cloud output
k6 run -o cloud tests/functional/auth/signup.js
TEST_PROFILE=functional k6 run -o cloud tests/functional/auth/signup.js

# Mix scenario test (recommended approach)
k6 run tests/mix/mix-scenario-weighted.js

# Other mix scenario approaches
k6 run tests/mix/mix-scenario.js
k6 run tests/mix/mix-scenario-advanced.js
k6 run tests/mix/mix-scenario-shared-iterations.js
```

### **Override Parameters**

```bash
# Custom VUs and duration
k6 run --vus 10 --duration 30s tests/smoke/smoke-test.js

# Run against different environments (BASE_URL auto-selected)
ENVIRONMENT=sit k6 run tests/smoke/smoke-test.js    # https://api.demoblaze.com (default)
ENVIRONMENT=uat k6 run tests/smoke/smoke-test.js    # https://api.uat.demoblaze.com
ENVIRONMENT=prod k6 run tests/smoke/smoke-test.js   # https://api.prod.demoblaze.com

# Manual BASE_URL override (bypasses environment mapping)
BASE_URL=https://api-dev.demoblaze.com k6 run tests/smoke/smoke-test.js

# Multiple overrides
ENVIRONMENT=uat \
VUS=5 \
DURATION=1m \
k6 run tests/functional/auth/signup.js
```

### **With Output Options**

```bash
# Save results to JSON
k6 run --out json=my-results.json tests/smoke/smoke-test.js

# Export summary
k6 run --summary-export=summary.json tests/smoke/smoke-test.js

# Both
k6 run \
  --out json=results.json \
  --summary-export=summary.json \
  tests/smoke/smoke-test.js
```

### **With Tags Filtering**

```bash
# Filter by tag
k6 run --tag test_type=smoke tests/smoke/smoke-test.js

# Multiple tags
k6 run --tag env=production --tag region=us tests/smoke/smoke-test.js
```

---

## 📊 **Comparison: Scripts vs Direct K6**

| Feature              | Shell Scripts                         | Direct K6                                   |
| -------------------- | ------------------------------------- | ------------------------------------------- |
| **Command**          | `./scripts/run-distribution-tests.sh` | `k6 run tests/mix/mix-scenario-weighted.js` |
| **Reports**          | ✅ Auto-generated                     | ❌ Manual (add flags)                       |
| **Exit Codes**       | ✅ Formatted output                   | ✅ Raw output                               |
| **Speed**            | Slightly slower                       | ⚡ Faster                                   |
| **Best For**         | CI/CD, Production                     | Development, Debug                          |
| **Output**           | Clean, formatted                      | K6 native output                            |
| **Reports Location** | `reports/`                            | Custom or none                              |

---

## 🎯 **When to Use Each Method**

### **Use Shell Scripts When:**

✅ **CI/CD Pipelines**

```yaml
# GitHub Actions, Jenkins, etc.
- run: ./scripts/run-all-tests.sh
```

✅ **Consistent Reporting**

- Need reports in specific format
- Archiving test results
- Tracking metrics over time

✅ **Team Standardization**

- Everyone uses same commands
- Consistent output format
- Easier onboarding

✅ **Production Testing**

- Formal test execution
- Need documented results
- Compliance requirements

### **Use Direct K6 When:**

⚡ **Active Development**

```bash
# Quick iteration
k6 run tests/smoke/smoke-test.js
# Edit test
k6 run tests/smoke/smoke-test.js
# Repeat...
```

⚡ **Debugging**

```bash
# Add console.logs
k6 run tests/smoke/smoke-test.js
# See immediate output
```

⚡ **Parameter Testing**

```bash
# Try different configurations
k6 run --vus 5 tests/smoke/smoke-test.js
k6 run --vus 10 tests/smoke/smoke-test.js
k6 run --vus 20 tests/smoke/smoke-test.js
```

⚡ **One-Off Tests**

```bash
# Quick validation
k6 run tests/smoke/smoke-test.js
```

---

## 🚫 **Common Mistakes**

### **❌ WRONG: Running Shell Script with k6**

```bash
k6 run scripts/run-smoke-tests.sh  # ERROR!
```

**Why it fails:**

- k6 expects JavaScript files (`.js`)
- Shell scripts (`.sh`) are bash commands, not k6 tests

**Error message:**

```
ERRO[0000] could not read 'scripts/run-smoke-tests.sh'
```

### **✅ CORRECT: Two Ways**

**Option 1: Run the shell script**

```bash
./scripts/run-smoke-tests.sh
```

**Option 2: Run the k6 test directly**

```bash
k6 run tests/smoke/smoke-test.js
```

---

## 🔧 **Advanced Usage**

### **Running Tests Across Different Environments**

The project supports three environments with automatic URL mapping:

**API URLs (apiUrls):**

| Environment | BASE_URL                         | Usage                                |
| ----------- | -------------------------------- | ------------------------------------ |
| **sit**     | `https://api.demoblaze.com`      | Default (System Integration Testing) |
| **uat**     | `https://api.uat.demoblaze.com`  | User Acceptance Testing              |
| **prod**    | `https://api.prod.demoblaze.com` | Production                           |

**Web URLs (webUrls):**

| Environment | WEB_URL                      | Usage                                |
| ----------- | ---------------------------- | ------------------------------------ |
| **sit**     | `https://demoblaze.com`      | Default (System Integration Testing) |
| **uat**     | `https://uat.demoblaze.com`  | User Acceptance Testing              |
| **prod**    | `https://prod.demoblaze.com` | Production                           |

#### **Using Shell Scripts**

```bash
# SIT (default - no environment needed)
./scripts/run-smoke-tests.sh                    # Cloud mode
./scripts/run-smoke-tests.sh local              # Local mode

# UAT
ENVIRONMENT=uat ./scripts/run-smoke-tests.sh cloud
ENVIRONMENT=uat ./scripts/run-smoke-tests.sh local

# Production
ENVIRONMENT=prod ./scripts/run-functional-tests.sh cloud
ENVIRONMENT=prod ./scripts/run-functional-tests.sh local

# Run all tests on UAT
ENVIRONMENT=uat ./scripts/run-all-tests.sh cloud
ENVIRONMENT=uat ./scripts/run-all-tests.sh local
```

#### **Using Direct K6 Commands**

```bash
# SIT (default)
k6 run tests/smoke/smoke-test.js

# UAT
ENVIRONMENT=uat k6 run tests/smoke/smoke-test.js

# Production
ENVIRONMENT=prod k6 run tests/functional/auth/signup.js
```

#### **Manual URL Override**

If you need to test against custom URLs (bypassing environment mapping):

```bash
# Custom API URL only
BASE_URL=https://api-dev.demoblaze.com ./scripts/run-smoke-tests.sh

# Custom web URL only
WEB_URL=https://dev.demoblaze.com k6 run tests/smoke/smoke-test.js

# Custom both API and web URLs
BASE_URL=https://api-staging.demoblaze.com \
WEB_URL=https://staging.demoblaze.com \
k6 run tests/smoke/smoke-test.js
```

#### **Persistent Environment Variables**

For multiple test runs on the same environment:

```bash
# Set environment once
export ENVIRONMENT=uat

# Run multiple tests
./scripts/run-smoke-tests.sh
./scripts/run-functional-tests.sh
k6 run tests/smoke/smoke-test.js

# Unset when done
unset ENVIRONMENT
```

### **Parallel Execution**

```bash
# Run tests in parallel (separate terminals or background)
k6 run tests/smoke/smoke-test.js &
k6 run tests/functional/auth/signup.js &
wait  # Wait for all to complete
```

### **With Cloud Output** (if you have Grafana Cloud)

```bash
# Direct k6 with cloud output
k6 run --out cloud tests/smoke/smoke-test.js

# Or use the shell scripts (recommended)
./scripts/run-smoke-tests.sh local    # Local execution with cloud streaming
./scripts/run-smoke-tests.sh cloud    # Direct cloud execution
```

### **With Multiple Outputs**

```bash
k6 run \
  --out json=reports/results.json \
  --out influxdb=http://localhost:8086/k6 \
  tests/smoke/smoke-test.js
```

---

## 📁 **Understanding Reports**

### **Report Files Generated by Scripts**

When you run shell scripts, reports are saved in `reports/`:

```
reports/
├── smoke-test-results.json      # Detailed metrics
├── smoke-test-summary.json      # Test summary
├── signup-results.json          # Functional test results
└── signup-summary.json          # Functional test summary
```

### **Viewing Reports**

**Summary JSON:**

```bash
cat reports/smoke-test-summary.json | jq
```

**Results JSON (large file):**

```bash
# View first 100 lines
head -n 100 reports/smoke-test-results.json

# Search for specific metrics
grep "http_req_duration" reports/smoke-test-results.json
```

### **Cleaning Reports**

```bash
./scripts/clean-reports.sh
```

Or manually:

```bash
rm -rf reports/*
```

---

## 🎓 **Quick Reference Card**

### **Common Commands**

#### **Jenkins Pipeline Commands**

| Task                                 | Command                                                    |
| ------------------------------------ | ---------------------------------------------------------- |
| Stage 01: Product SIT                | `./scripts/run-smoke-tests.sh cloud`                       |
| Stage 02: Smoke Performance          | `./scripts/run-smoke-tests.sh cloud load`                  |
| Stage 03: Functional Performance     | `./scripts/run-functional-tests.sh cloud load`             |
| Stage 04: Mix Performance            | `./scripts/run-distribution-tests.sh cloud ecommerce load` |
| Run all pipeline stages (simulation) | `./scripts/run-all-tests.sh cloud`                         |

#### **Development & Testing Commands**

| Task                                           | Command                                                                                                 |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Run smoke test (cloud)                         | `./scripts/run-smoke-tests.sh`                                                                          |
| Run smoke test (local)                         | `./scripts/run-smoke-tests.sh local`                                                                    |
| Run smoke test (specific profile)              | `./scripts/run-smoke-tests.sh cloud load`                                                               |
| Run smoke test (quick)                         | `k6 run tests/smoke/smoke-test.js`                                                                      |
| Run smoke test (specific profile)              | `TEST_PROFILE=stress k6 run tests/smoke/smoke-test.js`                                                  |
| Run mix scenario tests (cloud)                 | `./scripts/run-distribution-tests.sh`                                                                   |
| Run mix scenario tests (local)                 | `./scripts/run-distribution-tests.sh local`                                                             |
| Run mix scenario tests (specific test profile) | `./scripts/run-distribution-tests.sh cloud ecommerce load`                                              |
| Run mix test (quick)                           | `k6 run tests/mix/mix-scenario-weighted.js`                                                             |
| Run mix test (cloud)                           | `DISTRIBUTION_PROFILE=ecommerce k6 cloud tests/mix/mix-scenario-weighted.js`                            |
| Run mix test (local)                           | `DISTRIBUTION_PROFILE=ecommerce k6 run -o cloud tests/mix/mix-scenario-weighted.js`                     |
| Run mix test (specific test profile)           | `TEST_PROFILE=load DISTRIBUTION_PROFILE=ecommerce k6 cloud tests/mix/mix-scenario-weighted.js`          |
| Run mix test (specific test profile)           | `TEST_PROFILE=stress DISTRIBUTION_PROFILE=ecommerce k6 run -o cloud tests/mix/mix-scenario-weighted.js` |
| Run functional tests (cloud)                   | `./scripts/run-functional-tests.sh`                                                                     |
| Run functional tests (local)                   | `./scripts/run-functional-tests.sh local`                                                               |
| Run functional tests (specific profile)        | `./scripts/run-functional-tests.sh cloud load`                                                          |
| Run all tests (cloud)                          | `./scripts/run-all-tests.sh`                                                                            |
| Run all tests (local)                          | `./scripts/run-all-tests.sh local`                                                                      |
| Run all tests (specific profile)               | `./scripts/run-all-tests.sh cloud stress`                                                               |
| Clean reports                                  | `./scripts/clean-reports.sh`                                                                            |
| Override VUs                                   | `k6 run --vus 10 tests/smoke/smoke-test.js`                                                             |
| Override duration                              | `k6 run --duration 30s tests/smoke/smoke-test.js`                                                       |
| Run on UAT environment                         | `ENVIRONMENT=uat ./scripts/run-smoke-tests.sh cloud`                                                    |
| Run on PROD environment                        | `ENVIRONMENT=prod ./scripts/run-smoke-tests.sh local`                                                   |
| Custom BASE_URL                                | `BASE_URL=https://custom.url ./scripts/run-smoke-tests.sh`                                              |
| Check exit code                                | `./scripts/run-smoke-tests.sh; echo $?`                                                                 |

### **Project Structure**

```
k6-demoblaze/
├── tests/                    # K6 test files (.js)
│   ├── functional/
│   │   └── auth/
│   │       └── signup.js    # Run: k6 run tests/functional/auth/signup.js
│   ├── mix/
│   │   ├── mix-scenario-weighted.js    # Run: k6 run tests/mix/mix-scenario-weighted.js
│   │   ├── mix-scenario.js             # Run: k6 run tests/mix/mix-scenario.js
│   │   ├── mix-scenario-advanced.js    # Run: k6 run tests/mix/mix-scenario-advanced.js
│   │   └── mix-scenario-shared-iterations.js # Run: k6 run tests/mix/mix-scenario-shared-iterations.js
│   └── smoke/
│       └── smoke-test.js    # Run: k6 run tests/smoke/smoke-test.js
│
├── scripts/                  # Shell scripts (.sh)
│   ├── run-smoke-tests.sh   # Run: ./scripts/run-smoke-tests.sh
│   ├── run-distribution-tests.sh  # Run: ./scripts/run-distribution-tests.sh
│   ├── run-functional-tests.sh
│   ├── run-all-tests.sh
│   └── clean-reports.sh
│
└── reports/                  # Generated by scripts
    └── *.json               # Test results and summaries
```

---

## 💡 **Pro Tips**

### **1. Make Scripts Executable**

If you get "Permission denied":

```bash
chmod +x scripts/*.sh
```

### **2. Run from Project Root**

Always run from project directory:

```bash
cd /Users/minhanhoa.truong/Project/k6/k6-demoblaze
./scripts/run-smoke-tests.sh
```

### **3. Check Exit Codes**

For CI/CD integration:

```bash
./scripts/run-smoke-tests.sh
EXIT_CODE=$?
if [ $EXIT_CODE -eq 0 ]; then
  echo "Tests passed, deploying..."
else
  echo "Tests failed, stopping deployment"
  exit 1
fi
```

### **4. Use Aliases**

Add to `~/.zshrc` or `~/.bashrc`:

```bash
alias k6-smoke='cd ~/Project/k6/k6-demoblaze && ./scripts/run-smoke-tests.sh'
alias k6-mix='cd ~/Project/k6/k6-demoblaze && ./scripts/run-distribution-tests.sh'
alias k6-all='cd ~/Project/k6/k6-demoblaze && ./scripts/run-all-tests.sh'
```

Then just:

```bash
k6-smoke
k6-mix
k6-all
```

### **5. Monitor in Real-Time**

```bash
# Run test and watch reports
./scripts/run-smoke-tests.sh &
watch -n 1 'ls -lh reports/'
```

---

## 🐛 **Troubleshooting**

### **"Permission denied" Error**

**Problem:**

```bash
./scripts/run-smoke-tests.sh
# bash: ./scripts/run-smoke-tests.sh: Permission denied
```

**Solution:**

```bash
chmod +x scripts/run-smoke-tests.sh
```

### **"No such file or directory"**

**Problem:**

```bash
./scripts/run-smoke-tests.sh
# bash: ./scripts/run-smoke-tests.sh: No such file or directory
```

**Solution:**
Make sure you're in the project directory:

```bash
cd /Users/minhanhoa.truong/Project/k6/k6-demoblaze
./scripts/run-smoke-tests.sh
```

### **"command not found: k6"**

**Problem:**

```bash
k6 run tests/smoke/smoke-test.js
# k6: command not found
```

**Solution:**
Install k6:

```bash
# macOS
brew install k6

# Or download from https://k6.io/docs/getting-started/installation/
```

### **Tests Fail Unexpectedly**

**Check:**

1. Is the target system accessible?

```bash
curl https://www.demoblaze.com/index.html
```

2. Are environment variables set correctly?

```bash
echo $ENVIRONMENT  # Should be: sit, uat, or prod

# URLs are auto-determined from ENVIRONMENT:

# API URLs (apiUrls):
# sit  → https://api.demoblaze.com
# uat  → https://api.uat.demoblaze.com
# prod → https://api.prod.demoblaze.com

# Web URLs (webUrls):
# sit  → https://demoblaze.com
# uat  → https://uat.demoblaze.com
# prod → https://prod.demoblaze.com
```

3. Are thresholds too strict?

```bash
# Check test-profiles.js thresholds
cat src/config/test-profiles.js
```

---

## 📚 **Related Documentation**

- **Test Profiles:** `docs/TEST-PROFILES-GUIDE.md` - How to configure test parameters
- **Configuration:** `docs/CONFIGURATION-DECISION.md` - Understanding the config architecture
- **README:** `README.md` - Project overview and quick start

---

## 🎯 **Summary**

### **Three Ways to Run Tests**

1. **Jenkins Pipeline** (Production CI/CD)

   ```bash
   # Sequential pipeline execution (matches Jenkins stages)
   Stage 01: ./scripts/run-smoke-tests.sh cloud
   Stage 02: ./scripts/run-smoke-tests.sh cloud load
   Stage 03: ./scripts/run-functional-tests.sh cloud load
   Stage 04: ./scripts/run-distribution-tests.sh cloud ecommerce load
   ```

   - Best for: Production CI/CD, Jenkins integration, Sequential validation
   - **Cloud mode**: All stages run on k6 cloud infrastructure
   - **Fail-fast**: Stops on first stage failure

2. **Shell Scripts** (Automation)

   ```bash
   # Cloud mode (default) - runs on k6 cloud infrastructure
   ./scripts/run-smoke-tests.sh
   ./scripts/run-distribution-tests.sh

   # Local mode - runs locally and streams to cloud
   ./scripts/run-smoke-tests.sh local
   ./scripts/run-distribution-tests.sh local
   ```

   - Best for: Local automation, Testing, Consistent reporting
   - **Cloud mode**: Direct execution on k6 cloud infrastructure
   - **Local mode**: Local execution with cloud streaming and local reports

3. **Direct K6** (Quick Testing)
   ```bash
   k6 run tests/smoke/smoke-test.js
   k6 run tests/mix/mix-scenario-weighted.js
   ```
   - Best for: Development, Debugging, Quick iteration

### **Key Points**

✅ **Jenkins Pipeline**: Sequential execution matching your Jenkins stages  
✅ Shell scripts (`.sh`) are wrappers that run k6 internally  
✅ K6 test files (`.js`) contain the actual test logic  
✅ Use Jenkins pipeline for production, `./scripts/` for automation, `k6 run` for development  
✅ **Cloud mode** (default): Runs directly on k6 cloud infrastructure  
✅ **Local mode**: Runs locally, streams to cloud, generates local reports  
✅ Reports are generated automatically by shell scripts in local mode  
✅ All methods return proper exit codes for CI/CD  
✅ Project ID is managed centrally in `config-manager.js`

---

**Happy Testing! 🚀**
