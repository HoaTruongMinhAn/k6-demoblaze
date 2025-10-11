#!/bin/bash

###############################################################################
# Smoke Test Runner
# Runs quick validation tests to ensure system is functioning
#
# Note: Test configuration (VUs, duration, thresholds) is loaded from
#       src/config/test-profiles.js by the test file.
###############################################################################

set -e

echo "======================================"
echo "Running Smoke Tests"
echo "======================================"
echo ""
echo "Note: Tests use configuration from src/config/test-profiles.js"
echo "      Edit that file to change VUs, duration, or thresholds."
echo "======================================"

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

