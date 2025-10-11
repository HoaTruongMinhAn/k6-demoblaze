#!/bin/bash

###############################################################################
# Smoke Test Runner
# Runs quick validation tests to ensure system is functioning
###############################################################################

set -e

echo "======================================"
echo "Running Smoke Tests"
echo "======================================"

# Set environment variables
export ENVIRONMENT="${ENVIRONMENT:-sit}"
export BASE_URL="${BASE_URL:-https://api.demoblaze.com}"

# Create reports directory if it doesn't exist
mkdir -p reports

# Run smoke tests
k6 run \
  --out json=reports/smoke-test-results.json \
  --summary-export=reports/smoke-test-summary.json \
  tests/smoke/smoke-test.js

EXIT_CODE=$?

echo ""
echo "======================================"
if [ $EXIT_CODE -eq 0 ]; then
  echo "✅ Smoke Tests PASSED"
else
  echo "❌ Smoke Tests FAILED (Exit Code: $EXIT_CODE)"
fi
echo "======================================"

exit $EXIT_CODE

