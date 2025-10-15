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
