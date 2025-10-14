#!/bin/bash

###############################################################################
# Smoke Test Runner
# Runs quick validation tests to ensure system is functioning
#
# Usage:
#   ./scripts/run-smoke-tests.sh [local|cloud] [profile]
#   
# Options:
#   local  - Run locally and stream output to cloud
#   cloud  - Run directly on k6 cloud infrastructure (default)
#   profile - Test profile to use (smoke, functional, load, stress, spike, mix)
#            Defaults to 'smoke'
#
# Note: Test configuration (VUs, duration, thresholds) is loaded from
#       src/config/test-profiles.js by the test file.
###############################################################################

set -e

# Parse command line arguments
RUN_MODE=${1:-cloud}
TEST_PROFILE=${2:-"smoke"}

echo "======================================"
echo "Running Smoke Tests - Mode: $RUN_MODE - Profile: $TEST_PROFILE"
echo "======================================"
echo ""
echo "Note: Tests use configuration from src/config/test-profiles.js"
echo "      Edit that file to change VUs, duration, or thresholds."
echo "======================================"

# Create reports directory if it doesn't exist
mkdir -p reports

# Run smoke tests based on mode
if [ "$RUN_MODE" = "local" ]; then
  echo "Running locally with cloud output streaming..."
  echo "Project ID will be read from smoke-test.js configuration"
  echo ""
  
  k6 run \
    --out json=reports/smoke-test-results.json \
    --summary-export=reports/smoke-test-summary.json \
    -o cloud \
    --env TEST_PROFILE=$TEST_PROFILE \
    --env RUN_MODE=$RUN_MODE \
    tests/smoke/smoke-test.js
    
elif [ "$RUN_MODE" = "cloud" ]; then
  echo "Running directly on k6 cloud infrastructure..."
  echo "Project ID will be read from smoke-test.js configuration"
  echo ""
  
  TEST_PROFILE=$TEST_PROFILE RUN_MODE=$RUN_MODE k6 cloud tests/smoke/smoke-test.js
  
else
  echo "❌ Invalid run mode: $RUN_MODE"
  echo ""
    echo "Usage: $0 [local|cloud] [profile]"
    echo ""
    echo "Options:"
    echo "  local  - Run locally and stream output to cloud"
    echo "  cloud  - Run directly on k6 cloud infrastructure (default)"
    echo "  profile - Test profile to use (smoke, functional, load, stress, spike, mix)"
    echo "           Defaults to 'smoke'"
  exit 1
fi

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

