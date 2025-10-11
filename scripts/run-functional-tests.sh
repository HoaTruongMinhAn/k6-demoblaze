#!/bin/bash

###############################################################################
# Functional Test Runner
# Runs all functional tests with their configured profiles
#
# Note: Test configuration (VUs, duration, thresholds) is loaded from
#       src/config/test-profiles.js by each test file.
###############################################################################

set -e

echo "======================================"
echo "Running Functional Tests"
echo "======================================"
echo ""
echo "Note: Tests use configuration from src/config/test-profiles.js"
echo "      Edit that file to change VUs, duration, or thresholds."
echo "======================================"

# Create reports directory
mkdir -p reports

# Run functional tests
for test_file in tests/functional/*.js; do
  test_name=$(basename "$test_file" .js)
  echo ""
  echo "Running: $test_name"
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

