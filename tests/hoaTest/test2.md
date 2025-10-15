# Local mode entirely

DISTRIBUTION_PROFILE=ecommerce k6 run tests/mix/mix-scenario-weighted.js

# Local mode with mix profile

DISTRIBUTION_PROFILE=ecommerce k6 run -o cloud tests/mix/mix-scenario-weighted.js

# Cloud mode (default) with mix profile

DISTRIBUTION_PROFILE=ecommerce k6 cloud tests/mix/mix-scenario-weighted.js

# Cloud mode with specific test profile

TEST_PROFILE=load DISTRIBUTION_PROFILE=ecommerce k6 cloud tests/mix/mix-scenario-weighted.js
TEST_PROFILE=stress DISTRIBUTION_PROFILE=ecommerce k6 cloud tests/mix/mix-scenario-weighted.js

# Local mode with specific test profile

TEST_PROFILE=functional DISTRIBUTION_PROFILE=ecommerce k6 run -o cloud tests/mix/mix-scenario-weighted.js
TEST_PROFILE=spike DISTRIBUTION_PROFILE=ecommerce k6 run -o cloud tests/mix/mix-scenario-weighted.js

# With run mode environment variable

RUN_MODE=cloud TEST_PROFILE=load DISTRIBUTION_PROFILE=ecommerce k6 cloud tests/mix/mix-scenario-weighted.js
RUN_MODE=local TEST_PROFILE=stress DISTRIBUTION_PROFILE=ecommerce k6 run -o cloud tests/mix/mix-scenario-weighted.js
