# 🚀 K6 Performance Testing Framework

**Enterprise-grade performance testing suite for [Demoblaze](https://www.demoblaze.com/) built with Grafana K6**

A sophisticated, production-ready testing framework showcasing advanced software engineering practices, modular architecture, and comprehensive automation.

## ✨ Key Features

- **🏗️ Modular Architecture**: Clean separation of concerns with reusable API modules
- **🌍 Multi-Environment Support**: SIT/UAT/PROD with automatic URL mapping
- **📊 Comprehensive Testing**: Smoke, functional, and load test scenarios
- **⚡ Performance Monitoring**: Built-in thresholds and detailed reporting
- **🔧 Configuration Management**: Environment-based config with overrides
- **🤖 Automation Scripts**: One-command test execution across environments
- **📈 Advanced Scenarios**: Mix scenarios with weighted distributions

## 🏛️ Architecture Highlights

```
src/
├── api/           # Encapsulated API clients
├── config/        # Centralized configuration management
├── models/        # Data models and validation
└── utils/         # Reusable utility functions

tests/
├── functional/    # Business workflow validation
├── smoke/         # Critical path health checks
└── mix/           # Advanced weighted scenarios
```

## 🚀 Quick Start

```bash
# Clone and setup
git clone <repository-url>
cd k6-demoblaze
cp .env.example .env

# Run tests
./scripts/run-smoke-tests.sh          # Quick validation
./scripts/run-functional-tests.sh     # Business workflows
./scripts/run-all-tests.sh            # Complete suite

# Environment-specific execution
ENVIRONMENT=prod VUS=50 DURATION=10m ./scripts/run-all-tests.sh
```

## 💡 Technical Excellence

- **Configuration Management**: Dynamic environment mapping with fallback strategies
- **Error Handling**: Comprehensive error checking and graceful degradation
- **Performance Optimization**: Efficient resource utilization and timing controls
- **Code Quality**: JSDoc documentation, consistent patterns, and maintainable structure
- **CI/CD Ready**: Automated scripts and configurable thresholds

## 📊 Test Capabilities

| Test Type      | Purpose                   | Load         | Duration |
| -------------- | ------------------------- | ------------ | -------- |
| **Smoke**      | Critical path validation  | 1-2 VUs      | < 1min   |
| **Functional** | Business workflow testing | 2-10 VUs     | 1-5min   |
| **Load**       | Performance under load    | 10-100 VUs   | 5-30min  |
| **Mix**        | Realistic user behavior   | Configurable | Variable |

## 🔧 Advanced Configuration

```javascript
// Environment-aware configuration
const config = {
  environments: {
    sit: { api: "https://api.demoblaze.com", web: "https://demoblaze.com" },
    uat: {
      api: "https://api.uat.demoblaze.com",
      web: "https://uat.demoblaze.com",
    },
    prod: {
      api: "https://api.prod.demoblaze.com",
      web: "https://prod.demoblaze.com",
    },
  },
  thresholds: {
    http_req_duration: ["p(95)<500", "p(99)<1000"],
    http_req_failed: ["rate<0.01"],
    checks: ["rate>0.95"],
  },
};
```

## 📈 Reporting & Analytics

- **JSON Reports**: Detailed metrics and performance data
- **Threshold Monitoring**: Automated pass/fail criteria
- **Trend Analysis**: Historical performance tracking
- **Custom Metrics**: Business-specific KPIs

## 🛠️ Technologies & Skills Demonstrated

- **K6/Grafana**: Performance testing and monitoring
- **JavaScript ES6+**: Modern JavaScript patterns and modules
- **Configuration Management**: Environment-based configuration
- **API Design**: RESTful API testing and client abstraction
- **Automation**: Bash scripting and CI/CD integration
- **Software Architecture**: Modular design and separation of concerns
- **Testing Strategy**: Comprehensive test coverage and quality assurance

---

**Built with ❤️ to showcase enterprise-level performance testing expertise**
