#!/bin/bash

###############################################################################
# Functional Test Runner
# Runs all functional tests with their configured profiles
#
# Available Tests:
#   - auth/signup.js         : User registration test
#   - auth/login.js          : User login test
#   - auth/signup-login.js   : Complete authentication flow (signup + login)
#   - cart/addItems.js       : Add items to cart test
#   - cart/viewCart.js       : View cart test
#   - cart/addItems-viewCart.js : Complete cart flow (add items + view cart)
#
# Note: Test configuration (VUs, duration, thresholds) is loaded from
#       src/config/test-profiles.js by each test file.
###############################################################################

# Note: We don't use 'set -e' here because we want to continue running tests
# even if individual tests fail. We handle errors manually in the loop.

echo "======================================"
echo "Running Functional Tests"
echo "======================================"
echo ""

# Define test execution order
test_order=(
  "auth/signup.js"
  "auth/login.js"
  "auth/signup-login.js"
  "cart/addItems.js"
  "cart/viewCart.js"
  "cart/addItems-viewCart.js"
)

# Build full paths and count tests
test_files=()
for test_name in "${test_order[@]}"; do
  test_path="tests/functional/$test_name"
  if [ -f "$test_path" ]; then
    test_files+=("$test_path")
  else
    echo "⚠️  Warning: $test_name not found, skipping..."
  fi
done
total_tests=${#test_files[@]}

# Display discovered tests in order
echo "Discovered Tests: $total_tests (in execution order)"
for test_file in "${test_files[@]}"; do
  test_name=$(basename "$test_file" .js)
  echo "  • $test_name.js"
done

echo ""
echo "Note: Tests use configuration from src/config/test-profiles.js"
echo "      Edit that file to change VUs, duration, or thresholds."
echo "======================================"

# Create reports directory
mkdir -p reports

current_test=0

# Run functional tests in defined order
failed_tests=()
success_count=0

for test_file in "${test_files[@]}"; do
  current_test=$((current_test + 1))
  test_name=$(basename "$test_file" .js)
  echo ""
  echo "[$current_test/$total_tests] Running: $test_name"
  echo "--------------------------------------"
  
  k6 run \
    --out json="reports/${test_name}-results.json" \
    --summary-export="reports/${test_name}-summary.json" \
    "$test_file"
  
  if [ $? -eq 0 ]; then
    echo "✅ $test_name PASSED"
    ((success_count++))
  else
    echo "❌ $test_name FAILED"
    failed_tests+=("$test_name")
  fi
done

echo ""
echo "======================================"
echo "Functional Tests Summary"
echo "======================================"
echo "✅ Passed: $success_count/$total_tests"

if [ ${#failed_tests[@]} -gt 0 ]; then
  echo "❌ Failed: ${#failed_tests[@]} (${failed_tests[*]})"
  echo ""
  echo "Failed tests:"
  for failed_test in "${failed_tests[@]}"; do
    echo "  • $failed_test"
  done
  echo ""
  echo "⚠️  Some tests failed, but execution continued."
  echo "Check individual test reports for details."
else
  echo "✅ All tests passed!"
fi
echo "======================================"

