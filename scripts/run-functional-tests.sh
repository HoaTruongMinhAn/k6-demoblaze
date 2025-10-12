#!/bin/bash

###############################################################################
# Functional Test Runner
# Runs all functional tests with their configured profiles
#
# Available Tests:
#   - signup.js         : User registration test
#   - login.js          : User login test
#   - signup-login.js   : Complete authentication flow (signup + login)
#
# Note: Test configuration (VUs, duration, thresholds) is loaded from
#       src/config/test-profiles.js by each test file.
###############################################################################

set -e

echo "======================================"
echo "Running Functional Tests"
echo "======================================"
echo ""

# Define test execution order
test_order=(
  "signup.js"
  "login.js"
  "signup-login.js"
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
  else
    echo "❌ $test_name FAILED"
    exit 1
  fi
done

echo ""
echo "======================================"
echo "✅ All Functional Tests PASSED"
echo "======================================"

