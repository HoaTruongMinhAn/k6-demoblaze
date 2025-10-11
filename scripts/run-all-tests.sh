#!/bin/bash

###############################################################################
# Complete Test Suite Runner
# Runs all tests in sequence: smoke -> functional
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

