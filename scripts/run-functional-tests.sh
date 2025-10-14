#!/bin/bash

###############################################################################
# Functional Test Runner
# Runs all functional tests with their configured profiles
#
# Usage:
#   ./scripts/run-functional-tests.sh [local|cloud] [profile]
#   
# Options:
#   local  - Run locally and stream output to cloud
#   cloud  - Run directly on k6 cloud infrastructure (default)
#   profile - Test profile to use (smoke, functional, load, stress, spike, mix)
#            Defaults to 'functional'
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

# Parse command line arguments
RUN_MODE=${1:-cloud}
TEST_PROFILE=${2:-"functional"}

echo "======================================"
echo "Running Functional Tests - Mode: $RUN_MODE - Profile: $TEST_PROFILE"
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
  
  # Build k6 command based on run mode
  if [ "$RUN_MODE" = "local" ]; then
    k6 run \
      --out json="reports/${test_name}-results.json" \
      --summary-export="reports/${test_name}-summary.json" \
      -o cloud \
      --env TEST_PROFILE=$TEST_PROFILE \
      --env RUN_MODE=$RUN_MODE \
      "$test_file"
  elif [ "$RUN_MODE" = "cloud" ]; then
    TEST_PROFILE=$TEST_PROFILE RUN_MODE=$RUN_MODE k6 cloud "$test_file"
  else
    echo "❌ Invalid run mode: $RUN_MODE"
    echo ""
    echo "Usage: $0 [local|cloud] [profile]"
    echo ""
    echo "Options:"
    echo "  local  - Run locally and stream output to cloud"
    echo "  cloud  - Run directly on k6 cloud infrastructure (default)"
    echo "  profile - Test profile to use (smoke, functional, load, stress, spike, mix)"
    echo "           Defaults to 'functional'"
    exit 1
  fi
  
  if [ $? -eq 0 ]; then
    echo "✅ PASSED: $test_name"
    ((success_count++))
  else
    echo "❌ FAILED: $test_name"
    failed_tests+=("$test_name")
  fi
done

echo ""
echo "======================================"
echo "Functional Tests Summary"
echo "======================================"
echo "✅ Passed: $success_count/$total_tests"

if [ ${#failed_tests[@]} -gt 0 ]; then
  echo "❌ Failed: ${#failed_tests[@]} tests"
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