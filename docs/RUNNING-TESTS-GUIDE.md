# Running Tests Guide

Complete guide on how to run k6 tests in this project, including Jenkins pipeline integration.

## 🚀 Jenkins Pipeline Integration

The pipeline runs stages sequentially and stops on failure:

```
01 - Product SIT → 02 - Smoke Performance → 03 - Functional Performance → 04 - Mix Performance
```

### Jenkins Stages (Commands)

| Stage | Test Type              | Command                                                    |
| ----- | ---------------------- | ---------------------------------------------------------- |
| 01    | Product SIT            | `./scripts/run-smoke-tests.sh cloud`                       |
| 02    | Smoke Performance      | `./scripts/run-smoke-tests.sh cloud load`                  |
| 03    | Functional Performance | `./scripts/run-functional-tests.sh cloud load`             |
| 04    | Mix Performance        | `./scripts/run-distribution-tests.sh cloud ecommerce load` |

Benefits: cloud execution, centralized reporting, fail-fast, easy scaling.

---

## 🔍 What’s in this repo

- `tests/` JavaScript k6 tests (smoke, functional, mix)
- `scripts/` shell wrappers to run/format/report
- `reports/` output (when running locally via scripts)

---

## ✅ Method 1: Shell Scripts (Recommended)

Run the standardized wrappers used in CI/CD:

```bash
# Smoke
./scripts/run-smoke-tests.sh cloud        # default cloud mode
./scripts/run-smoke-tests.sh local        # local run with cloud streaming

# Functional
./scripts/run-functional-tests.sh cloud
./scripts/run-functional-tests.sh local

# Mix (distribution profiles)
./scripts/run-distribution-tests.sh cloud
./scripts/run-distribution-tests.sh local
```

Why: consistent output, proper exit codes, optional JSON reports in `reports/` (local mode).

---

## ⚡ Method 2: Direct k6 (Quick testing)

```bash
# Smoke
k6 run tests/smoke/smoke-test.js
k6 run -o cloud tests/smoke/smoke-test.js

# Mix (weighted, with profile)
DISTRIBUTION_PROFILE=ecommerce k6 run tests/mix/mix-scenario-weighted.js
TEST_PROFILE=load DISTRIBUTION_PROFILE=ecommerce k6 cloud tests/mix/mix-scenario-weighted.js
```

Tip: See `docs/TEST-PROFILES-GUIDE.md` for profiles and thresholds.

---

## 🌍 Running with Specific Environments

The project supports multiple environments: **`sit`** (default), **`uat`**, and **`prod`**.

### Using the `-e` flag (Recommended)

```bash
# Production environment
k6 run -e ENVIRONMENT=prod tests/smoke/smoke-test.js

# UAT environment
k6 run -e ENVIRONMENT=uat tests/smoke/smoke-test.js

# SIT environment (default, no flag needed)
k6 run tests/smoke/smoke-test.js
```

### Override URLs directly

```bash
# Bypass environment selection and set URLs directly
k6 run -e BASE_URL=https://api.prod.demoblaze.com -e WEB_URL=https://prod.demoblaze.com tests/smoke/smoke-test.js
```

### Full options (all possible combinations)

```bash
# Full example with all options for smoke test (uses VUS/DURATION)
k6 run \
  -e ENVIRONMENT=prod \
  -e VUS=10 \
  -e DURATION=30s \
  -e ITERATIONS=100 \
  -e API_TIMEOUT=60s \
  -e USERNAME_PREFIX=prod_user_ \
  -e PASSWORD=MTIzNDU2 \
  -o cloud \
  tests/smoke/smoke-test.js

# Full example with all options for functional test (uses TEST_PROFILE with stages)
# Note: Functional tests use stages, so VUS/DURATION won't work. Use TEST_PROFILE instead.
TEST_PROFILE=load k6 run \
  -e ENVIRONMENT=uat \
  -e API_TIMEOUT=45s \
  -e USERNAME_PREFIX=uat_user_ \
  -e PASSWORD=MTIzNDU2 \
  -o cloud \
  tests/functional/auth/signup-login.js

# Full example with all options for mix scenario (uses TEST_PROFILE + DISTRIBUTION_PROFILE)
TEST_PROFILE=load DISTRIBUTION_PROFILE=ecommerce k6 run \
  -e ENVIRONMENT=prod \
  -e API_TIMEOUT=30s \
  -e USERNAME_PREFIX=perf_test_ \
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
```

**Important Note:**

- **Smoke tests** use simple `vus`/`duration` - you can override with `-e VUS=X -e DURATION=Ys`
- **Functional tests** use `stages` - you must use `TEST_PROFILE` (e.g., functional, load, stress)
- **Mix tests** use `stages` - you must use both `TEST_PROFILE` and `DISTRIBUTION_PROFILE`
- Available profiles: `smoke`, `functional`, `load`, `stress`, `spike`, `mix` (see `src/config/test-profiles.js`)

---

## 🧰 Jenkinsfile example

```groovy
pipeline {
  agent any
  stages {
    stage('01 - Product SIT') { steps { sh './scripts/run-smoke-tests.sh cloud' } }
    stage('02 - Smoke Performance') { steps { sh './scripts/run-smoke-tests.sh cloud load' } }
    stage('03 - Functional Performance') { steps { sh './scripts/run-functional-tests.sh cloud load' } }
    stage('04 - Mix Performance') { steps { sh './scripts/run-distribution-tests.sh cloud ecommerce load' } }
  }
  post {
    always { archiveArtifacts artifacts: 'reports/*.json', allowEmptyArchive: true }
  }
}
```

---

## 🐛 Troubleshooting (short)

- Permissions: `chmod +x scripts/*.sh`
- Wrong folder: run from repo root
- k6 missing: install via Homebrew (macOS) or see k6 docs
- Network/threshold issues: verify `ENVIRONMENT`, URLs, and `src/config/test-profiles.js`

---

## 📚 More docs

- `docs/TEST-PROFILES-GUIDE.md`: profiles, thresholds, parameters
- `docs/CONFIGURATION.md`: configuration overview and usage
- `README.md`: project overview and quick start

---

Happy Testing! 🚀
