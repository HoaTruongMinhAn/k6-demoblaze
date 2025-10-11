# Running Tests Guide

Complete guide on how to run k6 tests in this project.

---

## 🔍 **Understanding File Types**

### **Shell Scripts (`.sh`)** - Automation Wrappers

Located in `scripts/` directory:

- `run-smoke-tests.sh`
- `run-functional-tests.sh`
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
- `tests/functional/sign-up.js`

**What they do:**

- Contain test logic
- Make HTTP requests
- Validate responses

**How to run:**

```bash
k6 run tests/smoke/smoke-test.js
```

---

## ✅ **Method 1: Using Shell Scripts** (Recommended for CI/CD)

### **Run Smoke Tests**

```bash
./scripts/run-smoke-tests.sh
```

**What it does:**

- ✅ Runs smoke test
- ✅ Generates JSON reports in `reports/`
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
./scripts/run-functional-tests.sh
```

**What it does:**

- ✅ Runs all tests in `tests/functional/`
- ✅ Generates reports for each test
- ✅ Stops on first failure
- ✅ Shows summary at end

### **Run All Tests**

```bash
./scripts/run-all-tests.sh
```

**What it does:**

- ✅ Runs smoke tests first
- ✅ If smoke passes, runs functional tests
- ✅ Shows total duration
- ✅ Comprehensive reporting

**Example output:**

```
==========================================
K6 Test Suite - Full Execution
==========================================

Step 1: Running Smoke Tests...
✅ Smoke tests passed

Step 2: Running Functional Tests...
✅ Functional tests passed

==========================================
✅ All Tests Completed Successfully
==========================================
Total Duration: 45s
Reports saved in: ./reports/
==========================================
```

### **Clean Reports**

```bash
./scripts/clean-reports.sh
```

Removes all generated test reports.

---

## ⚡ **Method 2: Direct K6 Commands** (Quick Testing)

### **Run Specific Test**

```bash
# Smoke test
k6 run tests/smoke/smoke-test.js

# Functional test
k6 run tests/functional/sign-up.js
```

### **Override Parameters**

```bash
# Custom VUs and duration
k6 run --vus 10 --duration 30s tests/smoke/smoke-test.js

# With environment variables
ENVIRONMENT=uat k6 run tests/smoke/smoke-test.js

# Multiple overrides
BASE_URL=https://api-dev.demoblaze.com \
VUS=5 \
DURATION=1m \
k6 run tests/functional/sign-up.js
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

| Feature              | Shell Scripts                  | Direct K6                          |
| -------------------- | ------------------------------ | ---------------------------------- |
| **Command**          | `./scripts/run-smoke-tests.sh` | `k6 run tests/smoke/smoke-test.js` |
| **Reports**          | ✅ Auto-generated              | ❌ Manual (add flags)              |
| **Exit Codes**       | ✅ Formatted output            | ✅ Raw output                      |
| **Speed**            | Slightly slower                | ⚡ Faster                          |
| **Best For**         | CI/CD, Production              | Development, Debug                 |
| **Output**           | Clean, formatted               | K6 native output                   |
| **Reports Location** | `reports/`                     | Custom or none                     |

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

### **Custom Environment**

```bash
# Set environment
export ENVIRONMENT=uat
export BASE_URL=https://api-uat.demoblaze.com

# Run test
./scripts/run-smoke-tests.sh
```

Or inline:

```bash
ENVIRONMENT=uat BASE_URL=https://api-uat.demoblaze.com ./scripts/run-smoke-tests.sh
```

### **Parallel Execution**

```bash
# Run tests in parallel (separate terminals or background)
k6 run tests/smoke/smoke-test.js &
k6 run tests/functional/sign-up.js &
wait  # Wait for all to complete
```

### **With Cloud Output** (if you have Grafana Cloud)

```bash
k6 run --out cloud tests/smoke/smoke-test.js
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
├── sign-up-results.json         # Functional test results
└── sign-up-summary.json         # Functional test summary
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

| Task                          | Command                                           |
| ----------------------------- | ------------------------------------------------- |
| Run smoke test (with reports) | `./scripts/run-smoke-tests.sh`                    |
| Run smoke test (quick)        | `k6 run tests/smoke/smoke-test.js`                |
| Run functional tests          | `./scripts/run-functional-tests.sh`               |
| Run all tests                 | `./scripts/run-all-tests.sh`                      |
| Clean reports                 | `./scripts/clean-reports.sh`                      |
| Override VUs                  | `k6 run --vus 10 tests/smoke/smoke-test.js`       |
| Override duration             | `k6 run --duration 30s tests/smoke/smoke-test.js` |
| Set environment               | `ENVIRONMENT=uat ./scripts/run-smoke-tests.sh`    |
| Check exit code               | `./scripts/run-smoke-tests.sh; echo $?`           |

### **Project Structure**

```
k6-demoblaze/
├── tests/                    # K6 test files (.js)
│   ├── functional/
│   │   └── sign-up.js       # Run: k6 run tests/functional/sign-up.js
│   └── smoke/
│       └── smoke-test.js    # Run: k6 run tests/smoke/smoke-test.js
│
├── scripts/                  # Shell scripts (.sh)
│   ├── run-smoke-tests.sh   # Run: ./scripts/run-smoke-tests.sh
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
alias k6-all='cd ~/Project/k6/k6-demoblaze && ./scripts/run-all-tests.sh'
```

Then just:

```bash
k6-smoke
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
echo $ENVIRONMENT
echo $BASE_URL
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

### **Two Ways to Run Tests**

1. **Shell Scripts** (Automation)

   ```bash
   ./scripts/run-smoke-tests.sh
   ```

   - Best for: CI/CD, Production, Consistent reporting

2. **Direct K6** (Quick Testing)
   ```bash
   k6 run tests/smoke/smoke-test.js
   ```
   - Best for: Development, Debugging, Quick iteration

### **Key Points**

✅ Shell scripts (`.sh`) are wrappers that run k6 internally  
✅ K6 test files (`.js`) contain the actual test logic  
✅ Use `./scripts/` for automation, `k6 run` for development  
✅ Reports are generated automatically by shell scripts  
✅ Both methods return proper exit codes for CI/CD

---

**Happy Testing! 🚀**
