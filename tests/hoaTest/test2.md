# Full example with all options for smoke test (uses VUS/DURATION)

k6 run \
 -e ENVIRONMENT=prod \
 -e VUS=10 \
 -e DURATION=30s \
 -e ITERATIONS=100 \
 -e API*TIMEOUT=60s \
 -e USERNAME_PREFIX=prod_user* \
 -e PASSWORD=MTIzNDU2 \
 -o cloud \
 tests/smoke/smoke-test.js

# Full example with all options for functional test (uses TEST_PROFILE with stages)

# Note: Functional tests use stages, so VUS/DURATION won't work. Use TEST_PROFILE instead.

TEST*PROFILE=load k6 run \
 -e ENVIRONMENT=uat \
 -e API_TIMEOUT=45s \
 -e USERNAME_PREFIX=uat_user* \
 -e PASSWORD=MTIzNDU2 \
 -o cloud \
 tests/functional/auth/signup-login.js

# Full example with all options for mix scenario (uses TEST_PROFILE + DISTRIBUTION_PROFILE)

TEST*PROFILE=load DISTRIBUTION_PROFILE=ecommerce k6 run \
 -e ENVIRONMENT=prod \
 -e API_TIMEOUT=30s \
 -e USERNAME_PREFIX=perf_test* \
 -e PASSWORD=MTIzNDU2 \
 -o cloud \
 tests/mix/mix-scenario-weighted.js

# Using shell scripts with environment and profile

ENVIRONMENT=prod TEST_PROFILE=load ./scripts/run-smoke-tests.sh cloud
ENVIRONMENT=uat TEST_PROFILE=stress ./scripts/run-functional-tests.sh cloud

# Quick combinations (common use cases)

k6 run -e ENVIRONMENT=prod -o cloud tests/smoke/smoke-test.js
k6 run -e ENVIRONMENT=uat -e VUS=5 -e DURATION=10s tests/smoke/smoke-test.js
TEST_PROFILE=load k6 run -e ENVIRONMENT=prod tests/functional/auth/signup.js
TEST_PROFILE=stress k6 run -e ENVIRONMENT=uat -o cloud tests/functional/auth/signup-login.js
