// Cloud mode (default) - runs on k6 cloud infrastructure with smoke profile
./scripts/run-smoke-tests.sh
./scripts/run-smoke-tests.sh cloud

// Local mode - runs locally and streams to cloud with smoke profile
./scripts/run-smoke-tests.sh local

// Cloud mode with specific test profile
./scripts/run-smoke-tests.sh cloud load
./scripts/run-smoke-tests.sh cloud stress

// Local mode with specific test profile
./scripts/run-smoke-tests.sh local functional
./scripts/run-smoke-tests.sh local spike