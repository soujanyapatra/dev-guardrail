# Getting Started with DevGuard

## Installation

Install DevGuard as a development dependency:

```bash
npm install -D devguard
```

Or with other package managers:

```bash
yarn add -D devguard
pnpm add -D devguard
```

## Quick Start

### 1. Initialize DevGuard

Run the initialization command in your project root:

```bash
npx devguard init
```

This will:
- Detect your project type
- Create `.devguard/config.yaml`
- Create a `reports/` directory
- Install recommended plugins based on your stack

### 2. Run Your First Check

```bash
devguard check
```

DevGuard will scan your codebase and display:
- Overall quality score
- Issues found (errors, warnings, info)
- Number of files scanned
- Execution time

### 3. View Detailed Report

Generate an HTML report:

```bash
devguard report --format html
```

Open `reports/report.html` in your browser to see:
- Visual score breakdown
- Issue details with file locations
- Suggestions for fixes
- Trend graphs (after multiple scans)

## Configuration

The `.devguard/config.yaml` file controls all settings:

```yaml
quality:
  minimumScore: 85
  failOnError: true

checks:
  lint:
    enabled: true
  security:
    enabled: true
  coverage:
    enabled: true
  # ... more checks

exclude:
  - "**/node_modules/**"
  - "**/dist/**"

include:
  - "**/*.ts"
  - "**/*.js"
```

## Git Hooks

Install pre-commit hooks to run checks automatically:

```bash
devguard hooks
```

Now DevGuard will run on every commit!

## CI Integration

Generate CI configuration:

```bash
devguard ci --platform github
```

This creates `.github/workflows/devguard.yml`:

```yaml
name: DevGuard Quality Check

on: [push, pull_request]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npx devguard check --ci
```

## Next Steps

- [Configuration Guide](./configuration.md)
- [Plugin Development](./plugin-development.md)
- [Custom Rules](./custom-rules.md)
- [CI/CD Integration](./ci-integration.md)
