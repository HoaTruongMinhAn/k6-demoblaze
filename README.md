# K6 Demoblaze Performance Testing Suite

Enterprise-grade performance testing framework for [Demoblaze](https://www.demoblaze.com/) using Grafana K6.

## 📁 Project Structure

```
k6-demoblaze/
├── tests/                      # Test scenarios
│   ├── functional/            # Functional test scenarios
│   │   └── sign-up.js        # User registration test
│   └── smoke/                 # Smoke test scenarios
│       └── smoke-test.js     # Basic health check
├── src/                       # Source code and modules
│   ├── api/                  # API client modules
│   │   └── auth-api.js       # Authentication API
│   ├── config/               # Configuration management
│   │   ├── config-manager.js # Configuration manager
│   │   └── constants.js      # Global constants
│   ├── utils/                # Utility functions
│   │   └── helpers.js        # Helper functions
│   └── models/               # Data models (future)
├── data/                      # Test data
│   ├── test-users.json       # User test data
│   └── test-config.json      # Environment configs
├── reports/                   # Test results (gitignored)
├── scripts/                   # Automation scripts
│   ├── run-smoke-tests.sh    # Run smoke tests
│   ├── run-functional-tests.sh # Run functional tests
│   ├── run-all-tests.sh      # Run all tests
│   └── clean-reports.sh      # Clean reports
├── .env.example              # Environment template
├── .gitignore                # Git ignore rules
└── README.md                 # This file
```

## 🚀 Quick Start

### Prerequisites

- [K6](https://k6.io/docs/getting-started/installation/) installed
- Bash shell (for running scripts)

### Installation

1. Clone the repository

```bash
git clone <repository-url>
cd k6-demoblaze
```

2. Copy environment template

```bash
cp .env.example .env
```

3. Edit `.env` with your configuration (optional)

### Running Tests

#### Run Smoke Tests

```bash
./scripts/run-smoke-tests.sh
```

#### Run Functional Tests

```bash
./scripts/run-functional-tests.sh
```

#### Run All Tests

```bash
./scripts/run-all-tests.sh
```

#### Run Specific Test

```bash
k6 run tests/functional/sign-up.js
```

## 🔧 Configuration

### Environment Variables

Configure tests via environment variables or `.env` file:

| Variable          | Description                           | Default                     |
| ----------------- | ------------------------------------- | --------------------------- |
| `ENVIRONMENT`     | Target environment (dev/sit/uat/prod) | `sit`                       |
| `BASE_URL`        | API base URL                          | `https://api.demoblaze.com` |
| `API_TIMEOUT`     | Request timeout                       | `30s`                       |
| `VUS`             | Number of virtual users               | `2`                         |
| `DURATION`        | Test duration                         | `30s`                       |
| `USERNAME_PREFIX` | Username prefix for test users        | `tango_`                    |
| `PASSWORD`        | Base64 encoded password               | `MTIzNDU2`                  |

### Example Usage

```bash
# Run with custom configuration
ENVIRONMENT=uat VUS=10 DURATION=5m ./scripts/run-functional-tests.sh

# Run with specific base URL
BASE_URL=https://api-dev.demoblaze.com k6 run tests/smoke/smoke-test.js
```

## 📊 Test Types

### Smoke Tests

- **Purpose**: Quick validation of critical functionality
- **Duration**: < 1 minute
- **Load**: 1-2 VUs
- **Run**: Before deployments or as health checks

### Functional Tests

- **Purpose**: Validate business workflows
- **Duration**: Variable (typically 1-5 minutes)
- **Load**: Low to moderate (2-10 VUs)
- **Run**: After changes to features

### Load Tests (Future)

- **Purpose**: Test under expected load
- **Duration**: 5-30 minutes
- **Load**: Moderate to high (10-100 VUs)
- **Run**: Before releases

### Stress Tests (Future)

- **Purpose**: Find system breaking points
- **Duration**: 10-60 minutes
- **Load**: High to extreme (50-500+ VUs)
- **Run**: Periodically for capacity planning

## 🏗️ Architecture

### Design Principles

1. **Separation of Concerns**: Tests, API logic, and configuration are separated
2. **Reusability**: API modules can be reused across tests
3. **Maintainability**: Changes in one area don't affect others
4. **Scalability**: Easy to add new tests and endpoints
5. **Documentation**: Comprehensive JSDoc comments

### Module Organization

#### API Modules (`src/api/`)

Encapsulate HTTP requests and response handling:

```javascript
import { signUp } from "../../src/api/auth-api.js";

const response = signUp(username, password);
```

#### Configuration (`src/config/`)

Centralized configuration management:

```javascript
import { configManager } from "../../src/config/config-manager.js";

const url = configManager.getUrl("SIGN_UP");
```

#### Utilities (`src/utils/`)

Reusable helper functions:

```javascript
import { formatResponse } from "../../src/utils/helpers.js";

console.log(formatResponse(response));
```

## 📝 Creating New Tests

### 1. Create Test File

```javascript
// tests/functional/new-feature.js
import { check } from "k6";
import { myApiCall } from "../../src/api/my-api.js";

export const options = {
  vus: 2,
  duration: "30s",
  tags: {
    test_type: "functional",
    feature: "my-feature",
  },
};

export default function () {
  const response = myApiCall();

  check(response, {
    "request successful": (r) => r.status === 200,
  });
}
```

### 2. Create API Module (if needed)

```javascript
// src/api/my-api.js
import http from "k6/http";
import { configManager } from "../config/config-manager.js";

export function myApiCall() {
  const url = configManager.getUrl("MY_ENDPOINT");
  return http.get(url);
}
```

### 3. Add Endpoint to Config

```javascript
// src/config/config-manager.js
ENDPOINTS: {
  SIGN_UP: "/signup",
  LOGIN: "/login",
  MY_ENDPOINT: "/my-endpoint" // Add this
}
```

## 📈 Reports

Test reports are generated in the `reports/` directory:

- `*-results.json`: Detailed test metrics
- `*-summary.json`: Test summary

### View Reports

```bash
# List all reports
ls -lh reports/

# View summary
cat reports/smoke-test-summary.json | jq
```

### Clean Reports

```bash
./scripts/clean-reports.sh
```

## 🧪 Thresholds

Default thresholds are configured in `src/config/config-manager.js`:

```javascript
THRESHOLDS: {
  http_req_duration: ["p(95)<500", "p(99)<1000", "max<2000"],
  http_req_failed: ["rate<0.01"],
  checks: ["rate>0.95"],
}
```

Override per test:

```javascript
export const options = {
  thresholds: {
    http_req_duration: ["p(95)<300"],
    checks: ["rate>0.99"],
  },
};
```

## 🔍 Best Practices

1. **Use meaningful check names**: Describe what you're validating
2. **Add think time**: Use `sleep()` to simulate real user behavior
3. **Tag your tests**: Use tags for filtering and organization
4. **Keep tests independent**: Each test should run standalone
5. **Use constants**: Define magic numbers and strings as constants
6. **Document your code**: Add JSDoc comments for functions
7. **Handle errors gracefully**: Check for error conditions
8. **Monitor trends**: Track metrics over time

## 🐛 Troubleshooting

### Tests fail with "Missing configuration"

- Ensure environment variables are set correctly
- Check `.env` file exists and has correct values

### Import errors

- Verify file paths in import statements
- Ensure all required modules exist

### Timeout errors

- Increase `API_TIMEOUT` environment variable
- Check network connectivity
- Verify target system is accessible

## 🤝 Contributing

1. Follow the existing code structure
2. Add tests for new features
3. Update documentation
4. Use meaningful commit messages
5. Add JSDoc comments to functions

## 📚 Resources

- [K6 Documentation](https://k6.io/docs/)
- [K6 JavaScript API](https://k6.io/docs/javascript-api/)
- [Best Practices](https://k6.io/docs/testing-guides/test-types/)
- [Grafana Cloud K6](https://grafana.com/products/cloud/k6/)

## 📄 License

MIT License - See LICENSE file for details

## 👥 Team

Maintained by the Performance Engineering Team

---

**Happy Testing! 🚀**
