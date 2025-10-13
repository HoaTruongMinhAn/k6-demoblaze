#!/bin/bash

###############################################################################
# Complete Test Suite Runner
# Runs all tests in sequence: smoke -> functional
#
# Automatically discovers and runs all test files in:
#   - tests/smoke/*.js
#   - tests/functional/*.js
#
# Note: Test configuration (VUs, duration, thresholds) is loaded from
#       src/config/test-profiles.js by each test file.
#       Edit that file to change test parameters.
###############################################################################

set -e

echo "=========================================="
echo "K6 Test Suite - Full Execution"
echo "=========================================="
echo ""

# Discover smoke tests
smoke_tests=(tests/smoke/*.js)

# Define functional test execution order (must match run-functional-tests.sh)
functional_test_order=(
  "signup.js"
  "login.js"
  "signup-login.js"
)

# Build functional test paths
functional_tests=()
for test_name in "${functional_test_order[@]}"; do
  test_path="tests/functional/$test_name"
  if [ -f "$test_path" ]; then
    functional_tests+=("$test_path")
  fi
done

echo "Test Suite:"
echo ""
echo "  Smoke Tests: ${#smoke_tests[@]}"
for test_file in "${smoke_tests[@]}"; do
  test_name=$(basename "$test_file" .js)
  echo "    • $test_name.js"
done

echo ""
echo "  Functional Tests: ${#functional_tests[@]} (in execution order)"
for test_file in "${functional_tests[@]}"; do
  test_name=$(basename "$test_file" .js)
  echo "    • $test_name.js"
done

echo ""
echo "  Mix Scenario Tests: 1 (dynamic distribution profiles)"
echo "    • run-distribution-tests.sh (auth_basic, ecommerce, high_conversion, browse_heavy, load_test)"

echo ""
echo "Configuration: src/config/test-profiles.js"
echo "=========================================="
echo ""

# Store start time
START_TIME=$(date +%s)

# Run smoke tests first
echo "Step 1: Running Smoke Tests..."
./scripts/run-smoke-tests.sh
if [ $? -ne 0 ]; then
  echo ""
  echo "❌ Smoke tests failed. Stopping execution."
  exit 1
fi

echo ""
echo "Step 2: Running Functional Tests..."
./scripts/run-functional-tests.sh
if [ $? -ne 0 ]; then
  echo ""
  echo "❌ Functional tests failed."
  exit 1
fi

echo ""
echo "Step 3: Running Mix Scenario Tests..."
./scripts/run-distribution-tests.sh
if [ $? -ne 0 ]; then
  echo ""
  echo "❌ Mix scenario tests failed."
  exit 1
fi

# Calculate duration
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

echo ""
echo "=========================================="
echo "✅ All Tests Completed Successfully"
echo "=========================================="
echo "Total Duration: ${DURATION}s"
echo "Reports saved in: ./reports/"
echo "=========================================="

