# dev-guardrail

> Deep code quality analysis for JavaScript, TypeScript, and PHP — one command, zero config

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm](https://img.shields.io/npm/v/dev-guardrail.svg)](https://www.npmjs.com/package/dev-guardrail)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![Node](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org)

**Package:** `dev-guardrail` | **CLI:** `devguard`

---

## Quick Start

```bash
npm install -D dev-guardrail
npx devguard init
npx devguard check
```

---

## CLI Commands

```bash
npx devguard init                        # Create .devguard/config.yaml
npx devguard check                       # Run all checks
npx devguard check --verbose             # Show info-level issues too
npx devguard check --ci                  # Exit 1 if score < minimum
npx devguard score                       # Print score only
npx devguard report --format html        # Generate HTML dashboard report
npx devguard report --format json        # Machine-readable JSON
npx devguard report --format markdown    # Markdown for docs
npx devguard doctor                      # Diagnose setup issues
npx devguard hooks                       # Install pre-commit Git hook
npx devguard plugins list                # List installed plugins
```

---

## What Gets Checked (10 checks, run in parallel)

| Check | Category | What it finds |
|---|---|---|
| `secret-detection` | Security | API keys, tokens, passwords, AWS keys, JWTs, private keys |
| `security-patterns` | Security | SQL injection, XSS, `eval()`, command injection, weak crypto |
| `console-log-detection` | Lint | `console.log/debug/warn/error`, `debugger` statements |
| `large-file-detection` | Lint | Files >700 lines or >100KB |
| `error-handling` | Lint | Empty catch, unhandled promises, `throw "string"`, `@` suppression |
| `naming-convention` | Lint | PascalCase classes, camelCase functions, Hungarian notation |
| `complexity` | Complexity | Cyclomatic complexity, deep nesting, long functions, too many params |
| `dead-code` | Lint | Unreachable code, commented-out blocks, `debugger`, always-true conditions |
| `performance` | Performance | `await` in loops, N+1 queries, sync fs calls, DOM in loops, memory leaks |
| `lint` | Lint | ESLint (if installed) or 12 built-in rules — each with a fix command |

**PHP-specific (auto-enabled when PHP project detected):**
- `php-debug` — `dd()`, `dump()`, `var_dump()`, `print_r()`
- `php-syntax` — Real PHP syntax checking
- `php-long-method` — Methods >50 lines

---

## LintCheck — ESLint Integration

The `lint` check works in two modes:

**Mode 1 — ESLint found:** Reads your existing `.eslintrc` / `eslint.config.js`, runs ESLint with `--format json`, and reports every error/warning. Fix command shown per issue:
```
[ESLint] 'x' is defined but never used [no-unused-vars]
src/app.ts:12
💡 Auto-fixable → run: npx eslint --fix "src/app.ts"
```

**Mode 2 — ESLint not installed:** Falls back to 12 built-in rules:

| Rule | What it catches |
|---|---|
| `no-var` | `var x` → use `const`/`let` |
| `eqeqeq` | `==` / `!=` → use `===` / `!==` |
| `no-trailing-spaces` | Trailing whitespace |
| `no-multiple-empty-lines` | 3+ consecutive blank lines |
| `prefer-const` | `let` that is never reassigned |
| `no-alert` | `alert()` calls |
| `no-implicit-coercion` | `!!x`, `~~x` |
| `no-empty-function` | `function foo() {}` |
| `max-line-length` | Lines >120 characters |
| `no-magic-numbers` | Raw numeric literals |
| `no-console-warn` | `console.warn/error` in production code |
| `no-unused-vars-hint` | `_prefixed` variables |

Every suggestion includes: `→ npx eslint --fix "<file>"`

---

## HTML Report

```bash
npx devguard report --format html
# Generates: reports/report.html
```

The HTML report is a full interactive dashboard:
- 🎯 **Score ring** — SVG progress circle coloured by grade
- 📋 **Summary stat cards** — files scanned, errors, warnings, info, duration
- 📊 **Category breakdown** — colour-coded progress bars
- 🔍 **Check results table** — score bar, issue count, duration, pass/fail per check
- 🐛 **Filterable issues table** — filter by All / Errors / Warnings / Info

---

## Configuration

`npx devguard init` creates `.devguard/config.yaml`:

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

plugins: []             # External plugin package names
```

---

## Using as a Library (Plugin Development)

This package also exports all its classes so you can build custom checks:

```typescript
import {
  // Main class
  DevGuard,

  // Extend this to build a custom check
  BaseCheck,

  // Available checks (use as reference)
  ComplexityCheck,
  DeadCodeCheck,
  PerformanceCheck,
  LintCheck,
  SecretDetectionCheck,
  SecurityPatternCheck,
  ConsoleLogCheck,
  LargeFileCheck,
  ErrorHandlingCheck,
  NamingConventionCheck,

  // Types
  Plugin,
  Check,
  CheckContext,
  CheckResult,
  Issue,
  Category,
  Severity,
  ScanResult,
  DevGuardConfig,

  // Utilities
  Logger,
  FileSystem,
  ScoringEngine,
  ProjectDetector,
  PluginManager,
  Scanner,
} from 'dev-guardrail';
```

### Building a Custom Check

```typescript
import { BaseCheck, CheckContext, CheckResult, Category, Severity } from 'dev-guardrail';

export class NoFetchCheck extends BaseCheck {
  name = 'no-fetch-without-timeout';
  category = Category.LINT;
  description = 'Detects fetch() calls without a timeout/abort controller';

  async run(context: CheckContext): Promise<CheckResult> {
    const [issues, duration] = await this.measureTime(async () => {
      const issues = [];
      const files = this.filterFiles(context.files, ['**/*.ts', '**/*.js']);

      for (const file of files) {
        const fullPath = require('path').join(context.projectPath, file);
        const content = await (await import('fs/promises')).readFile(fullPath, 'utf-8');
        const lines = content.split('\n');

        lines.forEach((line, i) => {
          if (line.match(/\bfetch\s*\(/) && !content.includes('AbortController')) {
            issues.push(this.createIssue({
              severity: Severity.WARNING,
              category: this.category,
              message: 'fetch() without AbortController — no timeout protection',
              file,
              line: i + 1,
              rule: 'no-fetch-without-timeout',
              suggestion: 'Wrap fetch with an AbortController and setTimeout for timeout handling',
            }));
          }
        });
      }

      return issues;
    });

    return this.createResult(issues.length === 0, issues, duration);
  }
}
```

### Registering as a Plugin

```typescript
import { Plugin } from 'dev-guardrail';
import { NoFetchCheck } from './checks/no-fetch-check';

export const myPlugin: Plugin = {
  name: 'my-company-plugin',
  version: '1.0.0',
  description: 'Company-specific DevGuard checks',
  checks: [new NoFetchCheck()],
};
```

Then in `.devguard/config.yaml`:
```yaml
plugins:
  - my-company-plugin
```

---

## Supported Files

| Extension | Language |
|---|---|
| `.ts`, `.tsx` | TypeScript |
| `.js`, `.mjs`, `.cjs` | JavaScript |
| `.jsx` | React |
| `.vue` | Vue.js |
| `.svelte` | Svelte |
| `.php`, `.blade.php` | PHP / Laravel Blade |

---

## CI/CD

```yaml
# GitHub Actions
- run: npx devguard check --ci
# Exits 1 if overall score < minimumScore (default: 85)
```

---

## Changelog

### v0.4.0 (current)
- ✅ Added `ComplexityCheck` — cyclomatic complexity, nesting depth, long functions, long params
- ✅ Added `DeadCodeCheck` — unreachable code, commented-out blocks, always-true conditions
- ✅ Added `PerformanceCheck` — N+1 queries, `await` in loops, sync fs calls, memory leaks
- ✅ Added `LintCheck` — ESLint integration with built-in fallback rules
- ✅ Rewrote HTML report — full dashboard with score ring, category bars, filterable issue table
- 🐛 Fixed `filterFiles()` glob→regex conversion bug (was generating invalid regexes)
- 🐛 Fixed `chalk`, `p-limit`, `ora` ESM/CJS compatibility (pinned to last CJS versions)
- 🐛 Fixed HTML report `timestamp.toISOString()` crash after JSON round-trip

### v0.3.x
- Added security pattern checks (SQL injection, XSS, command injection)
- Added secret detection (API keys, AWS keys, JWTs, private keys)
- Added naming convention checks (JS + PHP)
- Added error handling checks (JS + PHP)
- Added PHP-specific checks (debug, syntax, long methods, security)
- Plugin architecture with external plugin support

### v0.2.x
- Initial PHP support
- HTML/JSON/Markdown report generation
- Git hook installation
- CI mode (`--ci` flag)

### v0.1.x
- Initial release
- Basic JavaScript/TypeScript checks
- CLI with `init`, `check`, `score`, `report`, `doctor`, `hooks`

---

## License

MIT © DevGuard Contributors
