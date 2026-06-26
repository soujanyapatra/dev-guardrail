# dev-guardrail

> Code quality checks for JavaScript/TypeScript projects

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm](https://img.shields.io/npm/v/dev-guardrail.svg)](https://www.npmjs.com/package/dev-guardrail)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)

**Package:** `dev-guardrail` | **CLI:** `devguard`

## Quick Start

```bash
# Install
npm install -D dev-guardrail

# Initialize
npx devguard init

# Run checks
npx devguard check
```

> Use `npx devguard` for local installs, or `npm install -g dev-guardrail` for global access

## What It Does

dev-guardrail checks your JavaScript/TypeScript code for common issues:

- 🔍 Finds `console.log()` and `debugger` statements
- 📏 Detects large files that should be split
- 📝 Flags TODO/FIXME comments (optional)

Then gives you a quality score with a beautiful terminal UI.

## Supported Languages

- ✅ JavaScript (`.js`, `.jsx`)
- ✅ TypeScript (`.ts`, `.tsx`)

## How It Works

1. **Initialize** - Run `npx devguard init` to create config
2. **Check** - Run `npx devguard check` to scan your code
3. **View Score** - See quality score with progress bars
4. **Generate Reports** - Export results as HTML, JSON, or Markdown

```bash
npx devguard check

DevGuard - Quality Scan
──────────────────────────────────

Overall Score: 92% (Grade A)
──────────────────────────────────

Quality Breakdown:

Console Logs     95% ████████████████████
File Size        88% █████████████████
TODOs            90% ██████████████████

Files Scanned: 127
Issues Found: 24
Duration: 1.2s
```

## CLI Commands

```bash
npx devguard init              # Initialize in your project
npx devguard check             # Run quality checks
npx devguard score             # Show quality score
npx devguard report            # Generate HTML/JSON report
npx devguard doctor            # Check setup
npx devguard hooks             # Install git hooks
```

## Configuration

Customize with `.devguard/config.yaml`:

```yaml
quality:
  minimumScore: 85

checks:
  consoleLog:
    enabled: true
  largeFile:
    enabled: true
    maxLines: 500
    maxSizeKB: 100
  todoCheck:
    enabled: false
```

## Reports

Generate reports in multiple formats:

```bash
npx devguard report --format html       # Visual HTML report
npx devguard report --format json       # Machine-readable JSON
npx devguard report --format markdown   # Markdown for docs
```

## Git Hooks

Automatically run checks before commits:

```bash
npx devguard hooks
```

This installs a pre-commit hook that runs quality checks.

## CI/CD Integration

Use in GitHub Actions:

```yaml
name: Quality Check

on: [push, pull_request]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx devguard check --ci
```

Works with GitLab CI, Bitbucket Pipelines, Jenkins, and all major CI platforms.

## Project Detection

Automatically detects your project type:
- React, Vue, Next.js, Nuxt, Angular
- Node.js, Express, NestJS
- And shows it during initialization

## Extensible

Build custom checks with the plugin API:

```typescript
import { Plugin, BaseCheck } from 'dev-guardrail';

export const myPlugin: Plugin = {
  name: 'my-plugin',
  version: '1.0.0',
  checks: [new MyCustomCheck()],
};
```

See [Plugin Development Guide](./docs/plugin-development.md)

## Use Cases

**For Developers:**
- Catch issues before code review
- Maintain code quality standards
- Track quality metrics over time

**For Teams:**
- Enforce coding standards
- Prevent console.log in production
- Keep files manageable size
- CI/CD quality gates

**For Projects:**
- Onboarding new developers
- Technical debt tracking
- Quality monitoring

## Roadmap

**v0.2** - ESLint & Prettier integration  
**v0.3** - TypeScript compiler integration  
**v0.4** - Security scanning  
**v0.5** - Test coverage analysis  
**v1.0** - Production ready with full tool integration

## Contributing

We welcome contributions!

- 🐛 [Report bugs](https://github.com/your-org/dev-guardrail/issues)
- 💡 [Request features](https://github.com/your-org/dev-guardrail/discussions)
- 🔧 [Submit PRs](https://github.com/your-org/dev-guardrail/pulls)

See [CONTRIBUTING.md](./CONTRIBUTING.md)

## Documentation

- [Getting Started](./docs/getting-started.md)
- [Configuration](./docs/configuration.md)
- [Plugin Development](./docs/plugin-development.md)
- [CI Integration](./docs/ci-integration.md)

## License

MIT © dev-guardrail Contributors

---

**Simple, focused, effective** - Quality checks for JavaScript/TypeScript projects 🚀
