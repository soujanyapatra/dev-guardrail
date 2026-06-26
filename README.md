# dev-guardrail

> Deep code quality analysis for JavaScript, TypeScript, PHP and more — one command, zero config

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm](https://img.shields.io/npm/v/dev-guardrail.svg)](https://www.npmjs.com/package/dev-guardrail)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![Node](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org)

**Package:** `dev-guardrail` | **CLI:** `devguard`

---

## Quick Start

```bash
# Install
npm install -D dev-guardrail

# Initialize (creates .devguard/config.yaml)
npx devguard init

# Run all checks
npx devguard check

# Generate a full HTML report
npx devguard report --format html
```

Works on pure JS/TS projects, PHP projects, or mixed Laravel + Vue/React projects — zero configuration needed.

---

## What It Does

dev-guardrail runs **10 deep checks** in parallel and gives you a single quality score with actionable fixes.

### 🔒 Security Checks
- **Secret Detection** — API keys, passwords, tokens, AWS keys, DB credentials, JWT tokens, GitHub tokens
- **Security Patterns** — SQL injection, XSS, `eval()`, `innerHTML`, command injection, weak crypto (md5/sha1), open redirects, SSRF, PHP `unserialize()`

### 📐 Complexity Checks _(new in v0.4)_
- **Cyclomatic complexity** per function — warns at >7, errors at >10
- **Deep nesting** — flags code nested more than 4 levels deep
- **Long functions** — warns at >50 lines, errors at >100 lines
- **Long parameter lists** — >5 params triggers a suggestion to use an options object
- **Callback hell** — detects deeply nested callbacks

### 🧹 Dead Code Detection _(new in v0.4)_
- **Unreachable code** after `return` / `throw` / `break`
- **Commented-out code blocks** (3+ consecutive commented code lines)
- **Always-true/false conditions** — `if (true)`, `if (1 === 1)`
- **`debugger` statements** left in source

### ⚡ Performance Checks _(new in v0.4)_
- **`await` inside loops** — suggests `Promise.all()` for concurrency
- **DOM queries inside loops** — suggests caching the element outside
- **N+1 query problem** (PHP) — DB calls inside `foreach`
- **Synchronous `fs.*Sync` calls** — blocks the Node.js event loop
- **`addEventListener` without `removeEventListener`** — memory leak
- **`sleep()` / `usleep()`** in PHP — blocks the process

### 🔦 Linting _(new in v0.4)_
- **Uses your ESLint** if installed — reads your existing config, runs it, reports every error/warning with the exact fix command
- **Falls back to 12 built-in rules** if ESLint is not installed: `no-var`, `eqeqeq`, `no-trailing-spaces`, `prefer-const`, `no-alert`, `no-magic-numbers`, `max-line-length`, `no-empty-function`, and more
- Every issue shows: `npx eslint --fix <file>` to auto-fix

### 📋 Code Quality Checks

**JavaScript / TypeScript:**
- Console statements (`console.log`, `debugger`)
- Large files (>700 lines or >100KB)
- Error handling (missing try-catch, empty catch, unhandled promises)
- Naming conventions (PascalCase, camelCase, no Hungarian notation)

**PHP:**
- Debug statements (`dd()`, `dump()`, `var_dump()`, `print_r()`)
- Syntax validation (real PHP syntax checking)
- Long methods (>50 lines)
- Error handling (empty catch, `@` suppression, `die()`/`exit()`)
- Naming conventions (PSR-1 compliance)

### 📝 Optional Checks
- TODO/FIXME comments (enable in config)

---

## Supported Languages & Files

| Extension | Language |
|---|---|
| `.ts`, `.tsx` | TypeScript |
| `.js`, `.mjs`, `.cjs` | JavaScript |
| `.jsx` | React (JS) |
| `.vue` | Vue.js |
| `.svelte` | Svelte |
| `.php`, `.blade.php` | PHP / Laravel Blade |

Perfect for: **Laravel + Vue/React**, **MERN/MEVN**, **SvelteKit**, **Next.js**, **pure PHP**, **monorepos**.

---

## Example Output

```bash
$ npx devguard check

DevGuard - Quality Scan
──────────────────────────────────────────────────
ℹ Found 87 files to scan
ℹ Running 10 checks
✓ secret-detection       (0 issues,   54ms)
✓ security-patterns      (3 issues,   68ms)
✓ console-log-detection  (12 issues,  55ms)
✓ error-handling         (4 issues,   57ms)
✓ complexity             (6 issues,   48ms)
✓ dead-code              (2 issues,   44ms)
✓ performance            (3 issues,   46ms)
✓ lint                   (18 issues, 2100ms)
✓ naming-convention      (0 issues,   41ms)
✓ large-file-detection   (0 issues,   66ms)

──────────────────────────────────────────────────

  Overall Score: 78% (Grade B)

──────────────────────────────────────────────────

Quality Breakdown:

security         85% █████████████████░░░
lint             74% ██████████████░░░░░░
complexity       80% ████████████████░░░░
performance      60% ████████████░░░░░░░░

──────────────────────────────────────────────────
Issues Found
──────────────────────────────────────────────────

5 Errors:
  Potential hardcoded API Key detected [no-secrets]
  src/services/payment.ts:23
  💡 Use environment variables or a secrets manager

  Function 'processOrder' has cyclomatic complexity of 12 (max: 10) [cyclomatic-complexity]
  src/services/order.ts:45
  💡 Break into smaller, single-purpose functions

  await inside loop — sequential async calls are slow [no-await-in-loop]
  src/jobs/sync.ts:67
  💡 Use Promise.all() to run async operations concurrently

8 Warnings:
  [ESLint] 'userId' is defined but never used [no-unused-vars]
  src/controllers/user.ts:12
  💡 Auto-fixable → run: npx eslint --fix "src/controllers/user.ts"

  debugger statement found [no-debugger]
  src/utils/parser.ts:89
  💡 Remove the debugger statement

──────────────────────────────────────────────────
Files Scanned: 87
Duration: 2.4s
──────────────────────────────────────────────────

For full report: npx devguard report --format html
```

---

## CLI Commands

```bash
npx devguard init                        # Initialize in your project
npx devguard check                       # Run all 10 checks
npx devguard check --verbose             # Show all issues including info-level
npx devguard check --ci                  # Exit non-zero if score < minimum (for CI)
npx devguard score                       # Print quality score only
npx devguard report --format html        # Generate premium HTML dashboard report
npx devguard report --format json        # Machine-readable JSON
npx devguard report --format markdown    # Markdown for docs
npx devguard doctor                      # Diagnose setup
npx devguard hooks                       # Install pre-commit Git hook
npx devguard plugins list                # List installed plugins
```

---

## HTML Report

The `--format html` report is a full interactive dashboard:

- 📊 **Score ring** with grade (A+ → F)
- 📋 **Summary cards** — files scanned, errors, warnings, duration
- 📈 **Category breakdown** — colour-coded progress bars per category
- 🔍 **Check results table** — per-check score bar, issue count, pass/fail
- 🐛 **Filterable issues table** — filter by All / Errors / Warnings / Info

```bash
npx devguard report --format html
# → opens reports/report.html
```

---

## Configuration

Customize with `.devguard/config.yaml` (auto-created by `npx devguard init`):

```yaml
quality:
  minimumScore: 85      # CI fails below this score
  failOnError: true

checks:
  consoleLog:
    enabled: true
  largeFile:
    enabled: true
    maxLines: 700
    maxSizeKB: 100
  todoCheck:
    enabled: false       # Enable to flag TODO/FIXME comments
  phpDebug:
    enabled: true
  phpSyntax:
    enabled: true
  phpLongMethod:
    enabled: true
    maxLines: 50

exclude:
  - "**/node_modules/**"
  - "**/dist/**"
  - "**/vendor/**"

plugins: []             # Add external plugin packages here
```

---

## Git Hooks

Automatically run checks before every commit:

```bash
npx devguard hooks
```

Installs a `.git/hooks/pre-commit` that runs `devguard check --ci`.

---

## CI/CD Integration

### GitHub Actions

```yaml
name: Quality Check

on: [push, pull_request]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npx devguard check --ci
```

Also works with GitLab CI, Jenkins, CircleCI, and all major CI platforms.

---

## Laravel Projects

dev-guardrail auto-detects Laravel and checks both PHP and frontend files:

1. **Detects Laravel** — via `artisan` file + `app/` directory
2. **Checks PHP code** — controllers, models, services, migrations
3. **Checks frontend** — Vue/React files in `resources/js/`
4. **Unified score** — single quality score across all languages

```
my-laravel-app/
├── app/
│   ├── Http/Controllers/  ← ✅ PHP checks (security, complexity, naming)
│   └── Models/            ← ✅ PHP checks
├── resources/
│   └── js/
│       ├── app.js         ← ✅ JS/TS checks (lint, performance, dead code)
│       └── components/    ← ✅ Vue file checks
```

---

## Plugin Development

Build custom checks and ship them as npm packages:

```typescript
import { Plugin, BaseCheck, CheckContext, CheckResult, Category, Severity } from 'dev-guardrail';

class MyCustomCheck extends BaseCheck {
  name = 'my-rule';
  category = Category.LINT;
  description = 'My custom rule';

  async run(context: CheckContext): Promise<CheckResult> {
    const issues = [];
    // ... your logic
    return this.createResult(issues.length === 0, issues, 0);
  }
}

export const myPlugin: Plugin = {
  name: 'my-plugin',
  version: '1.0.0',
  checks: [new MyCustomCheck()],
};
```

Register in `.devguard/config.yaml`:

```yaml
plugins:
  - my-devguard-plugin
```

See [Plugin Development Guide](./docs/plugin-development.md)

---

## What Makes It Special

✨ **10 Deep Checks** — security, complexity, dead code, performance, lint, and more  
✨ **ESLint-aware** — uses your existing ESLint config if present, built-in rules if not  
✨ **Zero Config** — auto-detects Laravel, Vue, React, PHP, Next.js, etc.  
✨ **Multi-language** — JS/TS and PHP in the same scan  
✨ **Actionable** — every issue shows the exact command to fix it  
✨ **Premium HTML Report** — filterable dashboard with score ring and charts  
✨ **CI/CD Ready** — exit code 1 when quality score drops below threshold  

---

## Roadmap

**v0.4 (current)** — Complexity, dead code, performance analysis + ESLint lint check + premium HTML report  
**v0.5** — PHPStan integration, import/dependency analysis  
**v0.6** — Test coverage analysis, watch mode  
**v1.0** — Production-ready with full plugin ecosystem  

---

## Contributing

We welcome contributions!

- 🐛 [Report bugs](https://github.com/your-org/dev-guardrail/issues)
- 💡 [Request features](https://github.com/your-org/dev-guardrail/discussions)
- 🔧 [Submit PRs](https://github.com/your-org/dev-guardrail/pulls)

## Documentation

- [Getting Started](./docs/getting-started.md)
- [Configuration](./docs/configuration.md)
- [Plugin Development](./docs/plugin-development.md)
- [CI Integration](./docs/ci-integration.md)

## License

MIT © dev-guardrail Contributors

---

**World-class code quality for JavaScript, TypeScript, and PHP** 🚀
