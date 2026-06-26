# DevGuard — Project Summary

## Overview

DevGuard is a production-grade, open-source CLI and plugin ecosystem that provides a unified engineering quality platform. It's designed to be the "Lighthouse for code" — a single tool that orchestrates multiple deep quality checks with zero configuration.

## Core Philosophy

**One command to rule them all:**
```bash
npm install -D dev-guardrail
npx devguard init
npx devguard check
```

No manual configuration of ESLint, Prettier, TypeScript, security scanners, or dozens of other tools. DevGuard handles it all — and if you already have ESLint configured, it uses your existing config automatically.

---

## What's Built (v0.4.0)

### ✅ Core Package (`dev-guardrail`)

**Location:** `packages/core/` | **Published as:** `dev-guardrail` on npm

#### 1. CLI Interface (`src/cli.ts`)
- `devguard init` — Project initialization + config file creation
- `devguard check` — Run all 10 checks in parallel
- `devguard check --verbose` — Show all issues including info-level
- `devguard check --ci` — Exit code 1 if score < minimum threshold
- `devguard score` — Display quality score only
- `devguard report --format html|json|markdown` — Generate reports
- `devguard doctor` — Diagnose setup issues
- `devguard hooks` — Install/uninstall pre-commit Git hooks
- `devguard plugins list` — List installed plugins

#### 2. Core Systems

| System | File | Purpose |
|---|---|---|
| `ConfigManager` | `src/config/config-manager.ts` | Load `.devguard/config.yaml`, merge with defaults |
| `PluginManager` | `src/plugin/plugin-manager.ts` | Register plugins, collect checks |
| `Scanner` | `src/scanner/scanner.ts` | Parallel check execution (p-limit) |
| `ScoringEngine` | `src/scoring/scoring-engine.ts` | Weighted score + letter grade |
| `ProjectDetector` | `src/detector/project-detector.ts` | Auto-detect frameworks, languages, tools |
| `Logger` | `src/utils/logger.ts` | Chalk-based terminal output |
| `FileSystem` | `src/utils/file-system.ts` | Async file I/O + glob helpers |

#### 3. Native Checks (10 total)

All checks run in parallel via the plugin system. Each has a `name`, `category`, `description`, and produces `Issue[]` with file, line, rule ID, and a fix suggestion.

| Check | Category | Languages | What it finds |
|---|---|---|---|
| `SecretDetectionCheck` | Security | All | API keys, tokens, passwords, AWS keys, JWTs, private keys |
| `SecurityPatternCheck` | Security | JS/PHP | `eval()`, SQL injection, XSS, command injection, weak hashing, SSRF |
| `ConsoleLogCheck` | Lint | JS/TS | `console.log/debug/warn/error`, `debugger` |
| `LargeFileCheck` | Lint | All | Files >700 lines or >100KB |
| `ErrorHandlingCheck` | Lint | JS/PHP | Empty catch, unhandled promises, `throw "string"`, `@` suppression |
| `NamingConventionCheck` | Lint | JS/PHP | PascalCase classes, camelCase functions, Hungarian notation |
| `ComplexityCheck` | Complexity | JS/PHP | Cyclomatic complexity, nesting depth, long functions, long param lists |
| `DeadCodeCheck` | Lint | JS/PHP | Unreachable code, commented-out blocks, always-true conditions, `debugger` |
| `PerformanceCheck` | Performance | JS/PHP | `await` in loops, N+1 queries, sync fs calls, DOM queries in loops, memory leaks |
| `LintCheck` | Lint | JS/TS/Vue | ESLint (if installed) or 12 built-in rules with fix commands |

**PHP-specific checks (registered when PHP project detected):**
- `PHPDebugCheck` — `dd()`, `dump()`, `var_dump()`, `print_r()`
- `PHPSyntaxCheck` — Real PHP syntax validation
- `PHPLongMethodCheck` — Methods >50 lines
- `PHPTodoCheck` — TODO/FIXME in PHP (optional)
- `TodoCheck` — TODO/FIXME in JS/TS (optional)

#### 4. LintCheck — Smart ESLint Integration

**Auto-detection flow:**
```
Is ESLint installed in target project?
├── YES → Run real ESLint with --format json
│         Parse output → report each error/warning
│         Suggestion: npx eslint --fix <file>
└── NO  → Run 12 built-in rules:
          no-var, eqeqeq, no-trailing-spaces,
          prefer-const, no-alert, no-magic-numbers,
          max-line-length, no-empty-function,
          no-multiple-empty-lines, no-implicit-coercion,
          no-console-warn, no-unused-vars-hint
          Suggestion: npm install -D eslint + npx eslint --init
```

#### 5. HTML Report (fully rewritten in v0.4)

The old report was a bare-bones HTML page. The new one is a full interactive dashboard:

- **Score ring** — SVG circle progress coloured by score
- **Summary stat cards** — files, issues, errors, warnings, info, duration
- **Category breakdown bars** — colour-coded per category
- **Check results table** — per-check score bar, issue count, duration, pass/fail icon
- **Filterable issues table** — All / Errors / Warnings / Info filter buttons
- **Fix suggestions** — shown inline under each issue

**Bug fixed:** Old report crashed with `result.timestamp.toISOString is not a function` when timestamp was serialised to a string. Fixed with `instanceof Date` guard.

#### 6. Bug Fixes (v0.4)

| Bug | Root Cause | Fix |
|---|---|---|
| `filterFiles` invalid regex | `p.replace('*', '.*')` turned `**/*.ts` into `.**/*.ts` | Proper glob→regex converter |
| `chalk` / `p-limit` / `ora` ESM crash | Packages v5+ are pure ESM, project compiles to CJS | Pinned to last CJS versions |
| HTML report `timestamp.toISOString` crash | JSON round-trip makes timestamp a string | `instanceof Date` guard added |

---

## Package Structure

DevGuard uses a **monorepo architecture**:

### ✅ `packages/core/` — Published as `dev-guardrail`

The entire usable product lives here. All checks, CLI, scoring, and reporting.

```
packages/core/src/
├── cli.ts                      # CLI entry point (Commander.js)
├── devguard.ts                 # Main orchestrator class
├── checks/
│   ├── base-check.ts           # Abstract base for all checks
│   ├── secret-detection-check.ts
│   ├── security-pattern-check.ts
│   ├── console-log-check.ts
│   ├── large-file-check.ts
│   ├── error-handling-check.ts
│   ├── naming-convention-check.ts
│   ├── complexity-check.ts     ← new in v0.4
│   ├── dead-code-check.ts      ← new in v0.4
│   ├── performance-check.ts    ← new in v0.4
│   ├── lint-check.ts           ← new in v0.4
│   ├── php-debug-check.ts
│   ├── php-syntax-check.ts
│   ├── php-long-method-check.ts
│   ├── php-todo-check.ts
│   └── todo-check.ts
├── config/
│   └── config-manager.ts       # cosmiconfig-based YAML loader
├── detector/
│   └── project-detector.ts     # Framework/language auto-detection
├── plugin/
│   └── plugin-manager.ts       # Plugin registry + check collection
├── scanner/
│   └── scanner.ts              # Parallel check runner
├── scoring/
│   └── scoring-engine.ts       # Weighted category scoring
├── types/
│   └── index.ts                # All TypeScript interfaces/enums
└── utils/
    ├── logger.ts               # Chalk terminal output
    └── file-system.ts          # Async fs + glob helpers
```

### ⚠️ `packages/javascript/` — Future External Plugin

**Status:** Structure exists, not yet published.  
**Purpose:** Advanced JS/TS checks — deep ESLint integration, TypeScript compiler API, framework-specific rules.

Currently, basic JavaScript checks are built into core.

### ⚠️ `packages/php/` — Future External Plugin

**Status:** Structure created, not yet published.  
**Purpose:** Advanced PHP — PHPStan, PHP_CodeSniffer, Laravel-specific rules.

Currently, basic PHP checks are built into core.

---

## Scoring System

Weighted by category (adds up to 100%):

| Category | Weight |
|---|---|
| Security | 20% |
| Type Safety | 15% |
| Lint | 15% |
| Coverage | 10% |
| Architecture | 10% |
| Complexity | 10% |
| Performance | 5% |
| Documentation | 5% |
| Formatting | 5% |
| Testing | 5% |

**Grade scale:** A+ (≥95) → A (≥90) → A- (≥85) → B+ (≥80) → B (≥75) → B- (≥70) → C+ (≥65) → C (≥60) → C- (≥55) → D (≥50) → F (<50)

---

## Architecture Highlights

### Plugin System

```typescript
interface Plugin {
  name: string;
  version: string;
  checks: Check[];
  initialize?(context: PluginContext): Promise<void>;
  cleanup?(): Promise<void>;
}
```

All native checks are bundled as the `@devguard/native` plugin (v0.4.0). External plugins are loaded from npm packages listed in `config.plugins`.

### Check Interface

```typescript
interface Check {
  name: string;
  category: Category;
  description: string;
  enabled: boolean;
  weight: number;
  run(context: CheckContext): Promise<CheckResult>;
}
```

Every check extends `BaseCheck` which provides:
- `createIssue()` — generates a typed `Issue` with unique ID
- `createResult()` — wraps issues into `CheckResult` with score
- `filterFiles()` — proper glob→regex file filtering
- `measureTime()` — wraps async work and returns duration
- `calculateScore()` — error × 10 penalty, warning × 3 penalty

---

## Infrastructure

1. **Monorepo** — Turbo + npm workspaces + Changesets for versioning
2. **CI/CD** — GitHub Actions workflow for test + publish
3. **Code Quality** — ESLint + Prettier + TypeScript strict mode + Vitest

---

## Getting Started (For Contributors)

```bash
# Clone repository
git clone https://github.com/your-org/devguard.git
cd devguard

# Install dependencies
npm install

# Build core package
cd packages/core
npm run build

# Watch mode during development
npm run dev

# Run against this repo itself
node dist/cli.js check

# Generate HTML report
node dist/cli.js report --format html
```

---

## Next Steps

### High Priority

1. **PHPStan Integration**
   - Run PHPStan if installed, parse output, show results

2. **Watch Mode**
   - File watcher for real-time feedback during development

3. **Test Coverage**
   - Unit tests for all 10 checks
   - Integration tests for CLI commands
   - E2E tests with real projects

4. **Incremental Scanning**
   - Git diff-based — only scan changed files
   - Cache previous results for speed

### Medium Priority

1. **VS Code Extension**
   - Live quality score in status bar
   - Inline issue highlighting

2. **Fix Mode**
   - `devguard fix` — auto-apply fixable issues
   - Interactive prompt for unfixable ones

3. **Trend Analysis**
   - Historical score tracking between runs
   - `devguard report --diff` to see regression

4. **Additional Framework Checks**
   - React hooks rules
   - Vue composition API patterns
   - Angular best practices

### Low Priority

1. **AI Review Mode** — LLM integration for code smell detection
2. **Web Dashboard** — Hosted team reporting
3. **PDF Export** — From HTML report
4. **SARIF Format** — For GitHub Code Scanning integration

---

## Success Metrics (v0.4 Status)

| Feature | Status |
|---|---|
| Zero-config initialization | ✅ |
| Single command execution | ✅ |
| Security checks | ✅ |
| Complexity analysis | ✅ |
| Dead code detection | ✅ |
| Performance anti-pattern detection | ✅ |
| Linting (ESLint + built-in rules) | ✅ |
| Premium HTML report | ✅ |
| Markdown report | ✅ |
| JSON report | ✅ |
| Git hooks | ✅ |
| CI mode | ✅ |
| Plugin API | ✅ |
| PHP support | ✅ |
| Test coverage | 🔄 needs more |
| PHPStan integration | 🔄 planned v0.5 |
| Watch mode | 🔄 planned v0.6 |

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## License

MIT — See [LICENSE](./LICENSE)

---

**Built with ❤️ for the developer community**
