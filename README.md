# dev-guardrail

> Production-grade engineering quality platform - Alpha Release

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm](https://img.shields.io/npm/v/dev-guardrail.svg)](https://www.npmjs.com/package/dev-guardrail)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)

**Package:** `dev-guardrail` | **CLI:** `devguard`

## ⚠️ Alpha Status (v0.1.x)

dev-guardrail is in **early alpha**. Currently:

- ✅ Only **JavaScript/TypeScript** files are checked
- ✅ Only **3 basic checks** are implemented
- ❌ Python, PHP, and other languages are **not supported**

## What Works Right Now

✅ **JavaScript/TypeScript only** - Checks JS, TS, JSX, TSX files  
✅ **3 Basic Checks** - Console.log, large files, TODO detection  
✅ **Beautiful UI** - Terminal progress bars and colored output  
✅ **Report Generation** - HTML, JSON, Markdown formats  
✅ **Git Hooks** - Pre-commit hook installation  

## Quick Start

```bash
# Install
npm install -D dev-guardrail

# Initialize
npx devguard init

# Run checks
npx devguard check
```

> **Note:** Use `npx devguard` for local installs, or `npm install -g dev-guardrail` for global access

## What Gets Checked?

Currently only **3 checks** run on **JavaScript/TypeScript files** only:

1. **Console.log Detection** - Finds `console.log()` and `debugger` in `.js`, `.ts`, `.jsx`, `.tsx` files
2. **Large File Detection** - Flags any file >500 lines or >100KB (works on all file types)
3. **TODO Detection** - Finds TODO/FIXME comments in any file (optional)

> **Important:** Checks currently only work on JavaScript/TypeScript projects. Python, PHP, Laravel, Django files are not checked yet.

## Project Detection vs. Quality Checks

**Detection ≠ Checks**

- ✅ **Detection works** - dev-guardrail can identify React, Vue, Django, Laravel, PHP, Python projects
- ❌ **Checks don't work** - Only JS/TS files are actually analyzed for quality issues

When you run `npx devguard init` on a Python/PHP/Laravel project:
- It will detect the project type ✅
- It will create config files ✅  
- But `npx devguard check` will only find issues in JS/TS files ⚠️

**Example:** In a Laravel project with JS frontend:
- ✅ Detects: "Laravel + JavaScript"
- ✅ Checks: JavaScript files for console.log, large files, TODOs
- ❌ Doesn't check: PHP code, Laravel-specific issues

## What's NOT Implemented Yet ⚠️

**Language Support:**
- ❌ Python file checking
- ❌ PHP file checking
- ❌ Dart/Flutter file checking
- ❌ Any non-JS/TS language

**Tool Integration:**
- ❌ ESLint integration
- ❌ Prettier checks
- ❌ TypeScript compiler errors
- ❌ Security scanning (Semgrep, Gitleaks)
- ❌ Test coverage analysis
- ❌ Dependency vulnerabilities
- ❌ Dead code detection
- ❌ Complexity analysis

**Framework-Specific:**
- ❌ React hooks validation
- ❌ Vue composition API checks
- ❌ Django best practices
- ❌ Laravel validation
- ❌ Any framework-specific checks

## CLI Commands

```bash
npx devguard init              # Initialize in your project
npx devguard check             # Run the 3 checks
npx devguard score             # Show quality score
npx devguard report            # Generate HTML/JSON report
npx devguard doctor            # Check setup
npx devguard hooks             # Install git hooks
```

## Supported Languages

**Currently Supported:**
- ✅ JavaScript (`.js`, `.jsx`)
- ✅ TypeScript (`.ts`, `.tsx`)

**Not Supported Yet:**
- ❌ Python (`.py`)
- ❌ PHP (`.php`)
- ❌ Dart (`.dart` - Flutter)
- ❌ Other languages

**Why?** The 3 native checks are written for JS/TS only. Support for other languages requires building language-specific checks.

## Project Detection

dev-guardrail **detects** these project types:

**Frontend:** React, Vue, Nuxt, Next.js, Angular  
**Backend:** Node.js, Express, NestJS, Laravel, PHP, Python, Django, FastAPI  
**Mobile:** Flutter, React Native  

> **⚠️ IMPORTANT:** Detection means it recognizes your project type during `init`. It does NOT mean it checks those files for quality issues. Only JS/TS files are actually checked.

## How Scoring Works

```
Overall Score: 92% (Grade A)
───────────────────────────
Console Logs   95% ████████████████████
File Size      88% █████████████████
TODOs          90% ██████████████████
```

Score is based on issues found by the 3 implemented checks.

## Configuration

Generates `.devguard/config.yaml`:

```yaml
quality:
  minimumScore: 85

checks:
  consoleLog:
    enabled: true
  largeFile:
    enabled: true
  todoCheck:
    enabled: false  # Optional
```

## Reports

Generate reports with:

```bash
npx devguard report --format html
npx devguard report --format json
npx devguard report --format markdown
```

Reports show all detected issues with file locations and suggestions.

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

Works with GitLab CI, Bitbucket Pipelines, etc.

## Plugin Architecture (Ready, But No Plugins Yet)

The framework supports plugins:

```typescript
import { Plugin, BaseCheck } from 'dev-guardrail';

export const myPlugin: Plugin = {
  name: 'my-plugin',
  version: '1.0.0',
  checks: [new MyCustomCheck()],
};
```

The plugin system is functional - we just need to build the plugins!

See [Plugin Development Guide](./docs/plugin-development.md) for details.

## Why Publish Alpha?

The **core architecture is production-ready**:
- ✅ Plugin system works
- ✅ Scoring engine is functional
- ✅ CLI is stable
- ✅ Configuration management works
- ✅ Report generation works

We're publishing early so:
1. Developers can try the framework
2. Community can provide feedback
3. Contributors can help build integrations
4. We establish the API before 1.0

## Roadmap

### v0.2.0 - Tool Integration (Next)
- [ ] ESLint integration
- [ ] Prettier integration
- [ ] TypeScript compiler checks
- [ ] Basic security scanning (JS/TS only)

### v0.3.0 - Multi-Language Support
- [ ] Python file checking (Pylint, MyPy)
- [ ] PHP file checking (PHPStan)
- [ ] More native checks for JS/TS

### v0.4.0 - Framework Plugins
- [ ] React-specific checks (hooks, props)
- [ ] Vue-specific checks
- [ ] Django checks (Python)
- [ ] Laravel checks (PHP)

### v0.5.0 - Advanced Features
- [ ] Test coverage analysis
- [ ] Dependency scanning
- [ ] Dead code detection
- [ ] Complexity analysis

### v1.0.0 - Production Ready
- [ ] All core integrations complete
- [ ] Full multi-language support
- [ ] VS Code extension
- [ ] Comprehensive documentation
- [ ] Stable API

## Contributing

We welcome contributions! Priority areas:

1. **Tool Integrations** - ESLint, Prettier, TypeScript, etc.
2. **Framework Plugins** - React, Vue, Angular checks
3. **Native Checks** - More built-in quality checks
4. **Documentation** - Guides and examples
5. **Feedback** - What features do you need?

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## Documentation

- [Getting Started](./docs/getting-started.md)
- [Configuration](./docs/configuration.md)
- [Plugin Development](./docs/plugin-development.md)
- [Custom Rules](./docs/custom-rules.md)
- [CI Integration](./docs/ci-integration.md)
- [Architecture](./docs/architecture.md)

## Support

- 📦 [npm Package](https://www.npmjs.com/package/dev-guardrail)
- 🐛 [Report Issues](https://github.com/your-org/dev-guardrail/issues)
- 💬 [Discussions](https://github.com/your-org/dev-guardrail/discussions)
- 📖 [Documentation](./docs)

## License

MIT © dev-guardrail Contributors

---

**Be honest about what this is:** A solid framework with 3 basic checks. The architecture is ready for plugins - we just need to build them! 🚀
