#!/bin/bash

# Dynamic Distribution Test Runner
# Runs realistic user behavior simulation with configurable distribution profiles
# 
# Usage:
#   ./scripts/run-distribution-tests.sh [local|cloud] [profile]                    # Run all profiles with default settings
#   ./scripts/run-distribution-tests.sh [local|cloud] ecommerce                    # Run specific profile
#   VUS=10 DURATION=30s ./scripts/run-distribution-tests.sh [local|cloud]          # Run with custom VUs and duration
#   TEST_FILE=basic ./scripts/run-distribution-tests.sh [local|cloud]              # Run different test file
#
# Options:
#   local  - Run locally and stream output to cloud
#   cloud  - Run directly on k6 cloud infrastructure (default)
#
# Available test files:
#   - weighted (default): Dynamic distribution with configurable profiles
#   - basic: Simple approach using constant-vus executor  
#   - shared-iterations: Educational approach using shared-iterations executor
#   - advanced: Advanced approach with ramping patterns

# Note: We don't use 'set -e' here because we want to continue running all profiles
# even if individual profiles fail. We handle errors manually and show a summary.

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Parse command line arguments
RUN_MODE=${1:-cloud}
PROFILE_ARG=${2:-""}

# Default values
ENVIRONMENT=${ENVIRONMENT:-"sit"}
VUS=${VUS:-5}
DURATION=${DURATION:-10s}
OUTPUT_DIR=${OUTPUT_DIR:-"reports"}
TEST_FILE=${TEST_FILE:-"weighted"}
PROFILE=${DISTRIBUTION_PROFILE:-ecommerce}

echo -e "${BLUE}=== Dynamic Distribution Test Runner - Mode: ${RUN_MODE} ===${NC}"
echo -e "Environment: ${YELLOW}${ENVIRONMENT}${NC}"
echo -e "VUs: ${YELLOW}${VUS}${NC}"
echo -e "Duration: ${YELLOW}${DURATION}${NC}"
echo -e "Output Directory: ${YELLOW}${OUTPUT_DIR}${NC}"
echo -e "Test File: ${YELLOW}${TEST_FILE}${NC}"
echo -e "Profile: ${YELLOW}${PROFILE}${NC}"
echo ""

# Create output directory if it doesn't exist
mkdir -p ${OUTPUT_DIR}

# Select test file based on TEST_FILE parameter
get_test_file_path() {
    case ${TEST_FILE} in
        "weighted")
            echo "tests/mix/mix-scenario-weighted.js"
            ;;
        "basic")
            echo "tests/mix/mix-scenario.js"
            ;;
        "shared-iterations")
            echo "tests/mix/mix-scenario-shared-iterations.js"
            ;;
        "advanced")
            echo "tests/mix/mix-scenario-advanced.js"
            ;;
        *)
            echo -e "${RED}Error: Unknown test file '${TEST_FILE}'${NC}"
            echo -e "Available options: weighted, basic, shared-iterations, advanced"
            exit 1
            ;;
    esac
}

# Function to run a test with specific profile
run_test() {
    local profile=$1
    local description=$2
    local test_file_path=$(get_test_file_path)
    
    echo -e "${YELLOW}Running test with profile: ${profile}${NC}"
    echo -e "Description: ${description}"
    echo -e "Test File: ${YELLOW}${test_file_path}${NC}"
    echo "----------------------------------------"
    
    # Build k6 command based on run mode
    local k6_cmd=""
    local timestamp=$(date +"%Y%m%d_%H%M%S")
    local output_file="${OUTPUT_DIR}/mix-scenario-${profile}-results-${timestamp}.json"
    local summary_file="${OUTPUT_DIR}/mix-scenario-${profile}-summary-${timestamp}.json"
    
    if [ "$RUN_MODE" = "local" ]; then
        k6_cmd="k6 run"
        
        # Add environment variables
        k6_cmd="${k6_cmd} --env ENVIRONMENT=${ENVIRONMENT}"
        k6_cmd="${k6_cmd} --env VUS=${VUS}"
        k6_cmd="${k6_cmd} --env DURATION=${DURATION}"
        k6_cmd="${k6_cmd} --env RUN_MODE=${RUN_MODE}"
        
        # Add VUs and duration as CLI args only for non-weighted tests
        # Weighted tests use environment variables for configuration
        if [ "${TEST_FILE}" != "weighted" ]; then
            k6_cmd="${k6_cmd} --vus ${VUS}"
            k6_cmd="${k6_cmd} --duration ${DURATION}"
        fi
        
        # Add output options
        k6_cmd="${k6_cmd} --out json=${output_file}"
        k6_cmd="${k6_cmd} --summary-export=${summary_file}"
        k6_cmd="${k6_cmd} -o cloud"
        
    elif [ "$RUN_MODE" = "cloud" ]; then
        k6_cmd="k6 cloud"
        
        # Add environment variables for cloud execution
        k6_cmd="ENVIRONMENT=${ENVIRONMENT} VUS=${VUS} DURATION=${DURATION} RUN_MODE=${RUN_MODE} ${k6_cmd}"
        
    else
        echo -e "${RED}❌ Invalid run mode: $RUN_MODE${NC}"
        echo ""
        echo "Usage: $0 [local|cloud] [profile]"
        echo ""
        echo "Options:"
        echo "  local  - Run locally and stream output to cloud"
        echo "  cloud  - Run directly on k6 cloud infrastructure (default)"
        return 1
    fi
    
    # Add distribution profile for weighted test
    if [ "${TEST_FILE}" = "weighted" ]; then
        k6_cmd="DISTRIBUTION_PROFILE=${profile} ${k6_cmd}"
    fi
    
    # Add the test file
    k6_cmd="${k6_cmd} ${test_file_path}"
    
    # Show command only for single profile runs
    if [ "$1" != "" ]; then
        echo -e "Command: ${YELLOW}${k6_cmd}${NC}"
        echo ""
    fi
    
    # Run the test
    if eval ${k6_cmd}; then
        echo -e "\n${GREEN}✅ Test completed successfully!${NC}"
        echo -e "Results saved to: ${YELLOW}${output_file}${NC}"
        echo -e "Summary saved to: ${YELLOW}${summary_file}${NC}"
        
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
            }' ${summary_file} 2>/dev/null || echo "Summary format not available"
        fi
        return 0
    else
        echo -e "\n${RED}❌ Test failed!${NC}"
        echo -e "Results saved to: ${YELLOW}${output_file}${NC}"
        echo -e "Summary saved to: ${YELLOW}${summary_file}${NC}"
        return 1
    fi
    
    echo ""
    echo -e "${GREEN}Completed: ${profile}${NC}"
    echo "========================================"
    echo ""
}

# Available profiles - using functions for better compatibility
get_profile_description() {
    case "$1" in
        "auth_basic")
            echo "Basic authentication flow (20% signup, 20% login, 60% signup+login)"
            ;;
        "ecommerce")
            echo "E-commerce focused with shopping behaviors"
            ;;
        "high_conversion")
            echo "Optimized for purchase completion"
            ;;
        "browse_heavy")
            echo "Users mostly browsing"
            ;;
        "load_test")
            echo "Equal distribution for stress testing"
            ;;
        *)
            echo "Unknown profile"
            ;;
    esac
}

# List of available profiles
profiles=("auth_basic" "ecommerce" "high_conversion" "browse_heavy" "load_test")

# Check if profile exists
profile_exists() {
    for profile in "${profiles[@]}"; do
        if [ "$profile" = "$1" ]; then
            return 0
        fi
    done
    return 1
}

# If specific profile requested, run only that one
if [ "$PROFILE_ARG" != "" ]; then
    if profile_exists "$PROFILE_ARG"; then
        description=$(get_profile_description "$PROFILE_ARG")
        run_test "$PROFILE_ARG" "$description"
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Single profile test completed successfully!${NC}"
            exit 0
        else
            echo -e "${RED}❌ Single profile test failed!${NC}"
            echo -e "Check the test reports for details."
            exit 1
        fi
    else
        echo -e "${RED}Error: Unknown profile '$PROFILE_ARG'${NC}"
        echo "Available profiles:"
        for profile in "${profiles[@]}"; do
            description=$(get_profile_description "$profile")
            echo "  - $profile: $description"
        done
        exit 1
    fi
else
    # Run all profiles
    echo -e "${BLUE}Running all distribution profiles...${NC}"
    echo ""
    
    failed_profiles=()
    success_count=0
    
    for i in "${!profiles[@]}"; do
        profile="${profiles[$i]}"
        description=$(get_profile_description "$profile")
        echo -e "${BLUE}[$((i+1))/${#profiles[@]}] Running profile: ${YELLOW}${profile}${NC}"
        if run_test "$profile" "$description"; then
            ((success_count++))
        else
            failed_profiles+=("$profile")
        fi
    done
    
    echo -e "${BLUE}=== Final Results ===${NC}"
    echo -e "Successful: ${GREEN}${success_count}/${#profiles[@]}${NC}"
    
    if [ ${#failed_profiles[@]} -gt 0 ]; then
        echo -e "Failed: ${RED}${#failed_profiles[@]}${NC} (${failed_profiles[*]})"
        echo -e "${RED}❌ Some tests failed!${NC}"
        exit 1
    else
        echo -e "${GREEN}✅ All distribution tests completed successfully!${NC}"
    fi
fi

echo ""
echo -e "${BLUE}Usage Examples:${NC}"
echo "  # Run all profiles with default settings (cloud mode)"
echo "  ./scripts/run-distribution-tests.sh"
echo "  ./scripts/run-distribution-tests.sh cloud"
echo ""
echo "  # Run all profiles in local mode"
echo "  ./scripts/run-distribution-tests.sh local"
echo ""
echo "  # Run specific profile"
echo "  ./scripts/run-distribution-tests.sh cloud ecommerce"
echo "  ./scripts/run-distribution-tests.sh local ecommerce"
echo ""
echo "  # Run with custom VUs and duration"
echo "  VUS=10 DURATION=30s ./scripts/run-distribution-tests.sh cloud high_conversion"
echo ""
echo "  # Run with different test file"
echo "  TEST_FILE=basic ./scripts/run-distribution-tests.sh local auth_basic"
echo ""
echo "  # Run with custom environment and output directory"
echo "  ENVIRONMENT=uat OUTPUT_DIR=custom-reports ./scripts/run-distribution-tests.sh local"
echo ""
echo -e "${BLUE}Available Test Files:${NC}"
echo "  - weighted (default): Dynamic distribution with configurable profiles"
echo "  - basic: Simple approach using constant-vus executor"
echo "  - shared-iterations: Educational approach using shared-iterations executor"
echo "  - advanced: Advanced approach with ramping patterns"
echo ""
echo -e "${BLUE}Available Distribution Profiles:${NC}"
for profile in "${profiles[@]}"; do
    description=$(get_profile_description "$profile")
    echo "  - $profile: $description"
done
