# Configuration Guide

DevGuard uses `.devguard/config.yaml` for configuration.

## Configuration File Location

DevGuard looks for configuration in these locations (in order):

1. `.devguard/config.yaml`
2. `.devguard/config.json`
3. `.devguardrc.yaml`
4. `.devguardrc.json`
5. `.devguardrc`
6. `devguard.config.js`
7. `package.json` (in `devguard` field)

## Complete Configuration

```yaml
# Quality thresholds
quality:
  minimumScore: 85
  failOnError: true

# Individual check configuration
checks:
  lint:
    enabled: true
    options:
      rules:
        - no-console
        - no-debugger

  format:
    enabled: true
    options:
      prettier: true

  security:
    enabled: true
    options:
      strict: true
      scanDependencies: true

  secretScan:
    enabled: true
    options:
      patterns:
        - "api[_-]?key"
        - "secret"

  coverage:
    enabled: true
    options:
      threshold: 80
      perFile: false

  deadCode:
    enabled: true
    options:
      aggressive: false

  duplicateCode:
    enabled: true
    options:
      minLines: 5
      minTokens: 50

  complexity:
    enabled: true
    options:
      maxComplexity: 10
      maxDepth: 4

  architecture:
    enabled: true
    options:
      forbiddenDependencies:
        - "lodash"
      maxDependencies: 50

  dependencyAudit:
    enabled: true
    options:
      auditLevel: "moderate"
      ignoreDevDependencies: false

  performance:
    enabled: true
    options:
      budgets:
        - path: "*.js"
          maxSize: "100kb"

  tests:
    enabled: true
    options:
      requireTests: true
      testPattern: "**/*.test.{js,ts}"

  consoleLog:
    enabled: true
    options:
      allowInTests: true

  todoCheck:
    enabled: false
    options:
      treatAsWarning: true

  licenseCheck:
    enabled: true
    options:
      allowed:
        - MIT
        - Apache-2.0
        - ISC

  customRules:
    enabled: true
    options:
      rulesDir: ".devguard/rules"

# File patterns
exclude:
  - "**/node_modules/**"
  - "**/dist/**"
  - "**/build/**"
  - "**/coverage/**"
  - "**/.git/**"

include:
  - "src/**/*.ts"
  - "src/**/*.tsx"
  - "src/**/*.js"
  - "src/**/*.jsx"

# Plugin configuration
plugins:
  - "@devguard/javascript"
  - "@devguard/react"
  - "@devguard/security"
  - "@devguard/testing"

# Scoring weights (optional)
scoring:
  weights:
    security: 0.25
    typeSafety: 0.15
    lint: 0.15
    coverage: 0.10
    architecture: 0.10
    complexity: 0.10
    performance: 0.05
    documentation: 0.05
    formatting: 0.03
    testing: 0.02

# CI configuration
ci:
  verbose: true
  failFast: false
  reports:
    - json
    - html
    - markdown
```

## Check-Specific Configuration

### Lint

```yaml
checks:
  lint:
    enabled: true
    options:
      # Use project's ESLint config
      useProjectConfig: true
      # Override specific rules
      rules:
        no-console: error
        no-debugger: error
      # Ignore patterns
      ignore:
        - "**/*.config.js"
```

### Security

```yaml
checks:
  security:
    enabled: true
    options:
      # Strict mode - fail on any vulnerability
      strict: true
      # Scan dependencies
      scanDependencies: true
      # Ignore specific vulnerabilities
      ignore:
        - CVE-2021-12345
      # Custom Semgrep rules
      semgrepRules:
        - .devguard/semgrep-rules.yaml
```

### Coverage

```yaml
checks:
  coverage:
    enabled: true
    options:
      # Overall threshold
      threshold: 80
      # Per-file threshold
      perFile: true
      perFileThreshold: 70
      # Ignore patterns
      ignore:
        - "**/*.test.ts"
        - "**/__mocks__/**"
```

### Complexity

```yaml
checks:
  complexity:
    enabled: true
    options:
      # Maximum cyclomatic complexity
      maxComplexity: 10
      # Maximum nesting depth
      maxDepth: 4
      # Maximum file lines
      maxLines: 500
      # Maximum function lines
      maxFunctionLines: 50
```

## Environment Variables

Override configuration with environment variables:

```bash
# Minimum score
DEVGUARD_MIN_SCORE=90

# Config file path
DEVGUARD_CONFIG=.devguard/config.yaml

# Enable specific checks
DEVGUARD_CHECKS=lint,security,coverage

# CI mode
DEVGUARD_CI=true

# Verbose output
DEVGUARD_VERBOSE=true
```

## JavaScript Configuration

For dynamic configuration, use `devguard.config.js`:

```javascript
export default {
  quality: {
    minimumScore: 85,
  },
  checks: {
    lint: {
      enabled: true,
    },
  },
  // Dynamic exclude based on environment
  exclude: [
    '**/node_modules/**',
    process.env.NODE_ENV === 'development' ? '**/tmp/**' : null,
  ].filter(Boolean),
};
```

## Package.json Configuration

```json
{
  "devguard": {
    "quality": {
      "minimumScore": 85
    },
    "checks": {
      "lint": {
        "enabled": true
      }
    }
  }
}
```

## Per-Project vs Global

### Global Config

`~/.devguard/config.yaml` - Applied to all projects

### Project Config

`.devguard/config.yaml` - Project-specific overrides

Global settings are merged with project settings, with project taking precedence.

## Configuration Validation

Validate configuration:

```bash
devguard doctor
```

This checks:
- Configuration syntax
- Required dependencies
- Plugin availability
- Tool installations

## Common Configurations

### Strict Project

```yaml
quality:
  minimumScore: 95
  failOnError: true

checks:
  lint: { enabled: true }
  security: { enabled: true, options: { strict: true } }
  coverage: { enabled: true, options: { threshold: 90 } }
  tests: { enabled: true, options: { requireTests: true } }
```

### Lightweight Project

```yaml
quality:
  minimumScore: 70

checks:
  lint: { enabled: true }
  format: { enabled: true }
  consoleLog: { enabled: true }
```

### Legacy Project

```yaml
quality:
  minimumScore: 60
  failOnError: false

checks:
  # Enable only non-breaking checks
  lint: { enabled: false }
  format: { enabled: false }
  security: { enabled: true }
  secretScan: { enabled: true }
```

## Tips

1. Start with defaults, then customize
2. Use `devguard doctor` to validate
3. Commit configuration to version control
4. Document project-specific settings
5. Use environment variables for CI/CD
6. Share global config across teams
