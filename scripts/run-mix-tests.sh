#!/bin/bash

# Mix Scenario Test Runner
# Runs realistic user behavior simulation with weighted scenarios
# 
# Usage:
#   ./scripts/run-mix-tests.sh                    # Run with default settings
#   VUS=10 DURATION=30s ./scripts/run-mix-tests.sh # Run with custom VUs and duration
#   TEST_FILE=advanced ./scripts/run-mix-tests.sh  # Run different test file
#
# Available test files:
#   - weighted (default): Recommended approach using constant-vus executor
#   - basic: Simple approach using constant-vus executor  
#   - shared-iterations: Educational approach using shared-iterations executor
#   - advanced: Advanced approach with ramping patterns

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
ENVIRONMENT=${ENVIRONMENT:-"sit"}
VUS=${VUS:-""}
DURATION=${DURATION:-""}
OUTPUT_DIR=${OUTPUT_DIR:-"reports"}
TEST_FILE=${TEST_FILE:-"weighted"}

echo -e "${BLUE}=== Mix Scenario Test Runner ===${NC}"
echo -e "Environment: ${YELLOW}${ENVIRONMENT}${NC}"
echo -e "Output Directory: ${YELLOW}${OUTPUT_DIR}${NC}"
echo -e "Test File: ${YELLOW}${TEST_FILE}${NC}"

# Create output directory if it doesn't exist
mkdir -p ${OUTPUT_DIR}

# Select test file based on TEST_FILE parameter
case ${TEST_FILE} in
    "weighted")
        TEST_FILE_PATH="tests/mix/mix-scenario-weighted.js"
        echo -e "Using: ${YELLOW}Weighted Distribution (Recommended)${NC}"
        ;;
    "basic")
        TEST_FILE_PATH="tests/mix/mix-scenario.js"
        echo -e "Using: ${YELLOW}Basic Distribution${NC}"
        ;;
    "shared-iterations")
        TEST_FILE_PATH="tests/mix/mix-scenario-shared-iterations.js"
        echo -e "Using: ${YELLOW}Shared Iterations (Educational)${NC}"
        ;;
    "advanced")
        TEST_FILE_PATH="tests/mix/mix-scenario-advanced.js"
        echo -e "Using: ${YELLOW}Advanced Ramping Patterns${NC}"
        ;;
    *)
        echo -e "${RED}Error: Unknown test file '${TEST_FILE}'${NC}"
        echo -e "Available options: weighted, basic, shared-iterations, advanced"
        exit 1
        ;;
esac

# Build k6 command
K6_CMD="k6 run"

# Add environment variable
K6_CMD="${K6_CMD} --env ENVIRONMENT=${ENVIRONMENT}"

# Add VUs if specified
if [ ! -z "$VUS" ]; then
    echo -e "VUs: ${YELLOW}${VUS}${NC}"
    K6_CMD="${K6_CMD} --vus ${VUS}"
fi

# Add duration if specified
if [ ! -z "$DURATION" ]; then
    echo -e "Duration: ${YELLOW}${DURATION}${NC}"
    K6_CMD="${K6_CMD} --duration ${DURATION}"
fi

# Add output options
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
OUTPUT_FILE="${OUTPUT_DIR}/mix-scenario-results-${TIMESTAMP}.json"
SUMMARY_FILE="${OUTPUT_DIR}/mix-scenario-summary-${TIMESTAMP}.json"

K6_CMD="${K6_CMD} --out json=${OUTPUT_FILE}"
K6_CMD="${K6_CMD} --summary-export=${SUMMARY_FILE}"

# Add the test file
K6_CMD="${K6_CMD} ${TEST_FILE_PATH}"

echo -e "\n${BLUE}Running Mix Scenario Test...${NC}"
echo -e "Command: ${YELLOW}${K6_CMD}${NC}\n"

# Run the test
if eval ${K6_CMD}; then
    echo -e "\n${GREEN}✅ Mix scenario test completed successfully!${NC}"
    echo -e "Results saved to: ${YELLOW}${OUTPUT_FILE}${NC}"
    echo -e "Summary saved to: ${YELLOW}${SUMMARY_FILE}${NC}"
    
    # Display summary if jq is available
    if command -v jq &> /dev/null; then
        echo -e "\n${BLUE}=== Test Summary ===${NC}"
        jq '.metrics | {
            "Total Requests": .http_reqs.count,
            "Failed Requests": (.http_req_failed.count // 0),
            "Average Response Time (ms)": (.http_req_duration.avg | round),
            "90th Percentile (ms)": (.http_req_duration["p(90)"] | round),
            "95th Percentile (ms)": (.http_req_duration["p(95)"] | round),
            "Max Response Time (ms)": (.http_req_duration.max | round),
            "Checks Pass Rate (%)": (.checks.passes / (.checks.passes + .checks.fails) * 100 | round),
            "Total Iterations": .iterations.count,
            "Max VUs": .vus_max.value
        }' ${SUMMARY_FILE} 2>/dev/null || echo "Summary format not available"
    fi
else
    echo -e "\n${RED}❌ Mix scenario test failed!${NC}"
    exit 1
fi

echo -e "\n${BLUE}=== Mix Scenario Distribution ===${NC}"
echo -e "20% Signup Only (new users who abandon)"
echo -e "20% Login Only (returning users)"  
echo -e "60% Signup + Login (new users completing flow)"
echo -e "\n${BLUE}Note: 99th percentile is not calculated by default in K6.${NC}"
echo -e "To get 99th percentile, add 'p(99)' to your thresholds in test-profiles.js"
