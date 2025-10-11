#!/bin/bash

###############################################################################
# Functional Test Runner
# Runs all functional tests with configurable parameters
###############################################################################

set -e

echo "======================================"
echo "Running Functional Tests"
echo "======================================"

# Default values
ENVIRONMENT="${ENVIRONMENT:-sit}"
BASE_URL="${BASE_URL:-https://api.demoblaze.com}"
VUS="${VUS:-2}"
DURATION="${DURATION:-30s}"

echo "Configuration:"
echo "  Environment: $ENVIRONMENT"
echo "  Base URL: $BASE_URL"
echo "  VUs: $VUS"
echo "  Duration: $DURATION"
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
    --env ENVIRONMENT="$ENVIRONMENT" \
    --env BASE_URL="$BASE_URL" \
    --env VUS="$VUS" \
    --env DURATION="$DURATION" \
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

