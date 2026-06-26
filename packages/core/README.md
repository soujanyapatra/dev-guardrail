# dev-guardrail

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

That's it! dev-guardrail automatically detects your project type and runs comprehensive quality checks.

> **Note:** Always use `npx devguard` when installed as a dev dependency, or install globally with `npm install -g dev-guardrail` to use `devguard` directly.

## What is dev-guardrail?

dev-guardrail is like **Lighthouse for your code** - a unified engineering quality platform with a plugin architecture for quality checks.

**Current Status: Alpha (v0.1.x)** - Core framework is functional, external tool integrations coming soon.

## What Works Now (v0.1.x)

✅ **Project Detection** - Auto-detects 15+ frameworks (React, Vue, Next.js, Django, Laravel, etc.)  
✅ **Configuration System** - YAML-based configuration with sensible defaults  
✅ **Plugin Architecture** - Extensible system for adding checks  
✅ **Scoring Engine** - Weighted quality scoring (0-100)  
✅ **Beautiful Terminal UI** - Progress bars and color-coded output  
✅ **Report Generation** - HTML, JSON, and Markdown formats  
✅ **Git Hooks** - Pre-commit hook installation  
✅ **CI/CD Integration** - Works in CI environments  

## Native Checks (Built-in)

These checks work right now:
- **Console Log Detection** - Finds console.log/debugger statements
- **Large File Detection** - Identifies files >500 lines or >100KB
- **TODO Detection** - Finds TODO/FIXME comments (optional)

## Coming Soon

🔄 **External Tool Integration** (in progress):
- ESLint integration
- Prettier integration
- TypeScript compiler checks
- Security scanning (Semgrep, Gitleaks)
- Test coverage analysis
- Dependency auditing
- Dead code detection
- Complexity analysis

🔄 **More Native Checks**:
- Hardcoded credentials detection
- Circular dependency detection
- Naming convention validation
- Import order checking

## Current Limitations

⚠️ **What's NOT implemented yet**:
- External linter integration (ESLint, Prettier, etc.)
- Security scanning tools
- Coverage analysis
- Most advanced checks from the roadmap

This is an **alpha release** - the core framework works, but many features are planned for future releases.

## CLI Commands

```bash
npx devguard init              # Initialize dev-guardrail
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

## How It Works

dev-guardrail currently provides:

1. **Project Detection** - Automatically identifies your framework
2. **Native Quality Checks** - Runs built-in code analysis
3. **Scoring** - Calculates weighted quality score
4. **Reporting** - Generates beautiful reports

```bash
npx devguard init    # Creates .devguard/config.yaml
npx devguard check   # Runs all enabled checks
npx devguard score   # Shows quality score with progress bars
npx devguard report  # Generates HTML/JSON/Markdown report
```

## Quality Score

dev-guardrail calculates a weighted quality score:

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

dev-guardrail works with zero configuration, but you can customize:

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

dev-guardrail works with:
- GitLab CI
- Bitbucket Pipelines
- Azure DevOps
- Jenkins
- CircleCI
- And more!

## Extensibility

dev-guardrail has a plugin architecture for adding custom checks:

```typescript
import { Plugin, BaseCheck } from 'dev-guardrail';

export const myPlugin: Plugin = {
  name: 'my-custom-plugin',
  version: '1.0.0',
  checks: [new MyCustomCheck()],
};
```

See [Plugin Development Guide](https://github.com/your-org/dev-guardrail/blob/main/docs/plugin-development.md) for details.

## Roadmap

### v0.2.0 - Tool Integration
- [ ] ESLint integration
- [ ] Prettier integration  
- [ ] TypeScript compiler integration
- [ ] Basic security scanning

### v0.3.0 - Framework Plugins
- [ ] React-specific checks
- [ ] Vue-specific checks
- [ ] Node.js best practices

### v0.4.0 - Advanced Features
- [ ] Test coverage analysis
- [ ] Dependency vulnerability scanning
- [ ] Dead code detection
- [ ] Complexity analysis

### v1.0.0 - Production Ready
- [ ] All core integrations complete
- [ ] VS Code extension
- [ ] AI-powered code reviews
- [ ] Comprehensive documentation

## Contributing

We welcome contributions! This is an open-source project built for the developer community.

See [CONTRIBUTING.md](https://github.com/your-org/dev-guardrail/blob/main/CONTRIBUTING.md)

## Support

- 📖 [Documentation](https://github.com/your-org/dev-guardrail/tree/main/docs)
- 🐛 [Report Issues](https://github.com/your-org/dev-guardrail/issues)
- 💬 [Discussions](https://github.com/your-org/dev-guardrail/discussions)

## License

MIT © dev-guardrail Contributors

---

**Made with ❤️ for developers**
