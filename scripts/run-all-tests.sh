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

# Note: We don't use 'set -e' here because we want to continue running all test suites
# even if individual test suites fail. We handle errors manually and show a summary.

echo "=========================================="
echo "K6 Test Suite - Full Execution"
echo "=========================================="
echo ""

# Discover smoke tests
smoke_tests=(tests/smoke/*.js)

# Define functional test execution order (must match run-functional-tests.sh)
functional_test_order=(
  "auth/signup.js"
  "auth/login.js"
  "auth/signup-login.js"
  "cart/addItems.js"
  "cart/viewCart.js"
  "cart/addItems-viewCart.js"
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
smoke_exit_code=$?

echo ""
echo "Step 2: Running Functional Tests..."
./scripts/run-functional-tests.sh
functional_exit_code=$?

echo ""
echo "Step 3: Running Mix Scenario Tests..."
./scripts/run-distribution-tests.sh
distribution_exit_code=$?

# Calculate duration
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

echo ""
echo "=========================================="
echo "Test Suite Summary"
echo "=========================================="

# Count successful test suites
success_count=0
total_suites=3

if [ $smoke_exit_code -eq 0 ]; then
  echo "✅ Smoke Tests: PASSED"
  ((success_count++))
else
  echo "❌ Smoke Tests: FAILED"
fi

if [ $functional_exit_code -eq 0 ]; then
  echo "✅ Functional Tests: PASSED"
  ((success_count++))
else
  echo "❌ Functional Tests: FAILED"
fi

if [ $distribution_exit_code -eq 0 ]; then
  echo "✅ Mix Scenario Tests: PASSED"
  ((success_count++))
else
  echo "❌ Mix Scenario Tests: FAILED"
fi

echo ""
echo "Results: $success_count/$total_suites test suites passed"
echo "Total Duration: ${DURATION}s"
echo "Reports saved in: ./reports/"

if [ $success_count -eq $total_suites ]; then
  echo "✅ All test suites completed successfully!"
  exit 0
else
  echo "⚠️  Some test suites failed, but all tests were executed."
  echo "Check individual test reports for details."
  exit 1
fi
echo "=========================================="

