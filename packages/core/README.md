# DevGuard

> Production-grade engineering quality platform for modern development teams

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm version](https://badge.fury.io/js/dev-guardrail.svg)](https://www.npmjs.com/package/dev-guardrail)

## Quick Start

```bash
# Install
npm install -D dev-guardrail

# Initialize
npx devguard init

# Run quality checks
npx devguard check
```

That's it! DevGuard automatically detects your project type and runs comprehensive quality checks.

> **Note:** Always use `npx devguard` when installed as a dev dependency, or install globally with `npm install -g dev-guardrail` to use `devguard` directly.

## What is DevGuard?

DevGuard is like **Lighthouse for your code** - a unified engineering quality platform that orchestrates multiple quality tools under one simple interface.

Instead of manually configuring ESLint, Prettier, TypeScript, security scanners, and dozens of other tools, DevGuard handles everything with zero configuration.

## Features

- ✅ **Zero Configuration** - Works out of the box
- ✅ **Auto-Detection** - Detects your project type automatically  
- ✅ **Quality Score** - Get an overall engineering health score (0-100)
- ✅ **Multiple Checks** - Linting, security, complexity, and more
- ✅ **Beautiful Reports** - HTML, JSON, and Markdown outputs
- ✅ **Git Hooks** - Automatic pre-commit checks
- ✅ **CI/CD Ready** - Easy integration with all CI platforms
- ✅ **Extensible** - Plugin architecture for custom checks

## CLI Commands

```bash
npx devguard init              # Initialize DevGuard
npx devguard check             # Run all quality checks
npx devguard score             # Show quality score
npx devguard report            # Generate detailed report
npx devguard doctor            # Diagnose setup issues
npx devguard hooks             # Install Git hooks
```

### Add to package.json Scripts (Recommended)

```json
{
  "scripts": {
    "quality": "devguard check",
    "quality:score": "devguard score",
    "quality:report": "devguard report"
  }
}
```

Then run with `npm run quality`

### Global Installation (Optional)

```bash
npm install -g dev-guardrail
devguard check  # Now works without npx
```

## Built-in Checks

DevGuard includes native checks:

- **Console Log Detection** - Finds console.log and debugger statements
- **Large File Detection** - Identifies files that should be split
- **TODO Detection** - Finds TODO/FIXME comments
- More coming soon!

## Quality Score

DevGuard calculates a weighted quality score:

```
Overall Score: 92% (Grade A)
───────────────────────────
Security      95% ████████████████
Type Safety   90% █████████████████
Linting       88% █████████████████
Coverage      85% ████████████████
Complexity    92% ██████████████████
```

## Configuration

DevGuard works with zero configuration, but you can customize:

```yaml
# .devguard/config.yaml
quality:
  minimumScore: 85

checks:
  lint:
    enabled: true
  security:
    enabled: true
  coverage:
    enabled: true
  consoleLog:
    enabled: true
```

## CI/CD Integration

### GitHub Actions

```yaml
name: Quality Check

on: [push, pull_request]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npx devguard check --ci
```

### Other Platforms

DevGuard works with:
- GitLab CI
- Bitbucket Pipelines
- Azure DevOps
- Jenkins
- CircleCI
- And more!

## Plugin System

Extend DevGuard with plugins (coming soon):

```bash
npm install -D @devguard/react @devguard/security
```

## Current Status

**Version 0.1.0 - Alpha Release**

DevGuard is in active development. The core framework is functional with:
- CLI interface
- Configuration system
- Plugin architecture
- Native checks
- Scoring engine
- Report generation

### Roadmap

- [ ] External tool integrations (ESLint, Prettier, etc.)
- [ ] More native checks
- [ ] Framework-specific plugins (React, Vue, etc.)
- [ ] Security scanning (Semgrep, Gitleaks)
- [ ] VS Code extension
- [ ] AI-powered code reviews

## Contributing

We welcome contributions! This is an open-source project built for the developer community.

See [CONTRIBUTING.md](https://github.com/your-org/devguard/blob/main/CONTRIBUTING.md)

## Support

- 📖 [Documentation](https://github.com/your-org/devguard/tree/main/docs)
- 🐛 [Report Issues](https://github.com/your-org/devguard/issues)
- 💬 [Discussions](https://github.com/your-org/devguard/discussions)

## License

MIT © DevGuard Contributors

---

**Made with ❤️ for developers**
