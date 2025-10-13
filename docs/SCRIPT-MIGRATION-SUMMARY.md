# Script Migration Summary

## Overview

The `run-mix-tests.sh` script has been **enhanced and replaced** with `run-distribution-tests.sh` to provide dynamic distribution profiles and better functionality.

## What Changed

### ✅ **Enhanced Features**

| Feature            | Old (`run-mix-tests.sh`) | New (`run-distribution-tests.sh`)                               |
| ------------------ | ------------------------ | --------------------------------------------------------------- |
| **Distribution**   | Hardcoded 20/20/60       | **5 Dynamic Profiles**                                          |
| **Profiles**       | Single pattern           | auth_basic, ecommerce, high_conversion, browse_heavy, load_test |
| **Configuration**  | Limited                  | Environment variables + CLI args                                |
| **Test Files**     | 4 types                  | 4 types + dynamic distribution                                  |
| **Output**         | JSON reports             | JSON reports + enhanced summary                                 |
| **Error Handling** | Basic                    | Comprehensive with failure tracking                             |
| **Usage**          | Single command           | Multiple usage patterns                                         |

### 🔄 **Migration Path**

#### **Old Usage:**

```bash
# Run with default settings
./scripts/run-mix-tests.sh

# Run with custom parameters
VUS=20 DURATION=60s ./scripts/run-mix-tests.sh

# Run different test file
TEST_FILE=basic ./scripts/run-mix-tests.sh
```

#### **New Usage:**

```bash
# Run all distribution profiles (equivalent to old default)
./scripts/run-distribution-tests.sh

# Run specific profile (new capability)
./scripts/run-distribution-tests.sh ecommerce

# Run with custom parameters (same as before)
VUS=20 DURATION=60s ./scripts/run-distribution-tests.sh

# Run different test file (same as before)
TEST_FILE=basic ./scripts/run-distribution-tests.sh auth_basic
```

## New Capabilities

### 🎯 **Dynamic Distribution Profiles**

1. **`auth_basic`** (Default) - Matches old behavior

   - 20% signup only, 20% login only, 60% signup+login

2. **`ecommerce`** - Shopping-focused behavior

   - More cart and order activities

3. **`high_conversion`** - Purchase completion optimized

   - Higher percentage of order completions

4. **`browse_heavy`** - Browsing users

   - Mostly browsing, less purchasing

5. **`load_test`** - Equal distribution
   - All scenarios get equal VU allocation

### 🛠 **Enhanced Configuration**

```bash
# Environment variables
ENVIRONMENT=uat
VUS=20
DURATION=60s
OUTPUT_DIR=custom-reports
TEST_FILE=weighted
DISTRIBUTION_PROFILE=ecommerce

# Run with all options
ENVIRONMENT=uat VUS=20 DURATION=60s OUTPUT_DIR=custom-reports ./scripts/run-distribution-tests.sh ecommerce
```

### 📊 **Better Reporting**

- **JSON Output**: Individual files per profile
- **Enhanced Summary**: jq-formatted metrics
- **Failure Tracking**: Detailed error reporting
- **Progress Indicators**: Clear success/failure status

## Backward Compatibility

### ✅ **What Still Works**

- All existing command-line parameters
- Same test file support (basic, advanced, shared-iterations)
- Same output format and reporting
- Same environment variable support

### ⚠️ **What Changed**

- **Script name**: `run-mix-tests.sh` → `run-distribution-tests.sh`
- **Default behavior**: Now runs all profiles instead of single profile
- **Profile selection**: New `DISTRIBUTION_PROFILE` environment variable

## Updated Documentation

### 📚 **Files Updated**

1. **`RUNNING-TESTS-GUIDE.md`**

   - Updated all references to use new script
   - Added distribution profile explanations
   - Enhanced usage examples

2. **`MIX-SCENARIOS-GUIDE.md`**

   - Updated script references
   - Added profile selection examples

3. **`run-all-tests.sh`**

   - Added mix scenario tests to full test suite
   - Updated test descriptions

4. **`run-mix-tests.sh`**
   - Added deprecation notice
   - Still functional but marked for removal

## Migration Steps

### 🔄 **For Users**

1. **Update scripts**: Replace `run-mix-tests.sh` with `run-distribution-tests.sh`
2. **Update CI/CD**: Update pipeline scripts to use new command
3. **Update documentation**: Update any internal docs referencing old script
4. **Test new profiles**: Try different distribution profiles for your use cases

### 🔄 **For Developers**

1. **New scenarios**: Add to distribution profiles in `test-profiles.js`
2. **Custom profiles**: Create new distribution patterns as needed
3. **Test files**: Add new test file types to `get_test_file_path()` function

## Benefits

### 🚀 **Immediate Benefits**

- **No more hardcoded percentages** - Easy to adjust user behavior patterns
- **Multiple test scenarios** - Test different business patterns
- **Better reporting** - Enhanced metrics and error handling
- **Future-proof** - Easy to add new scenarios and profiles

### 📈 **Long-term Benefits**

- **Realistic load testing** - Model actual user behavior patterns
- **A/B testing** - Compare different distribution patterns
- **Scalable** - Easy to add new scenarios as features grow
- **Maintainable** - Centralized configuration management

## Deprecation Timeline

- **Phase 1** (Current): `run-mix-tests.sh` marked as deprecated but functional
- **Phase 2** (Future): `run-mix-tests.sh` will be removed
- **Phase 3** (Future): All references updated to new script

## Support

For questions or issues with the migration:

1. Check the enhanced `run-distribution-tests.sh` script
2. Review the updated documentation
3. Test with different distribution profiles
4. Use the `--help` equivalent (usage examples in script output)

The new system provides significantly more flexibility and maintainability while preserving all existing functionality.
