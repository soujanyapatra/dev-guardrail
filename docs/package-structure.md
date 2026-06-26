# DevGuard Package Structure

## Overview

DevGuard uses a **monorepo architecture** with language-specific plugins. This makes it easy to add new languages and maintain code organization.

## Package Architecture

```
devguard/
├── packages/
│   ├── core/           # Core framework (required)
│   ├── javascript/     # JavaScript/TypeScript plugin
│   ├── php/            # PHP plugin
│   ├── python/         # Python plugin (future)
│   ├── go/             # Go plugin (future)
│   └── rust/           # Rust plugin (future)
├── docs/
├── examples/
└── README.md
```

---

## Package: `core` (Published as `dev-guardrail`)

**Purpose:** Core framework with universal checks and plugin architecture

### What's Included:

**Core Infrastructure:**
- CLI commands (init, check, report, doctor, etc.)
- Configuration management
- Plugin system
- Scanner and orchestration
- Scoring engine
- Report generation (HTML, JSON, Markdown)
- Project detection

**Universal Checks** (apply to all languages):
- ✅ `SecretDetectionCheck` - Finds hardcoded secrets in any file
- ✅ `LargeFileCheck` - Detects files >700 lines
- ✅ `TodoCheck` - Finds TODO/FIXME comments (optional)

**Language-Specific Checks** (built-in for simplicity):
- ✅ `ConsoleLogCheck` - JavaScript debug statements
- ✅ `ErrorHandlingCheck` - JS/TS and PHP error patterns
- ✅ `NamingConventionCheck` - JS/TS and PHP naming
- ✅ `SecurityPatternCheck` - JS/TS and PHP security vulnerabilities

**Why built-in?** These checks are fundamental and work out-of-the-box without external dependencies.

### Structure:

```
packages/core/
├── src/
│   ├── checks/              # All checks (universal + built-in language checks)
│   │   ├── base-check.ts
│   │   ├── secret-detection-check.ts       # Universal
│   │   ├── large-file-check.ts             # Universal
│   │   ├── todo-check.ts                   # Universal
│   │   ├── console-log-check.ts            # JavaScript
│   │   ├── error-handling-check.ts         # JavaScript + PHP
│   │   ├── naming-convention-check.ts      # JavaScript + PHP
│   │   ├── security-pattern-check.ts       # JavaScript + PHP
│   │   ├── php-debug-check.ts              # PHP
│   │   ├── php-syntax-check.ts             # PHP
│   │   ├── php-long-method-check.ts        # PHP
│   │   └── php-todo-check.ts               # PHP
│   ├── cli.ts               # CLI interface
│   ├── devguard.ts          # Main class
│   ├── config/              # Configuration management
│   ├── plugin/              # Plugin system
│   ├── scanner/             # File scanning and orchestration
│   ├── scoring/             # Quality score calculation
│   ├── detector/            # Project type detection
│   ├── types/               # TypeScript types
│   └── utils/               # Utilities
├── package.json
└── README.md
```

### Published As:
```bash
npm install -D dev-guardrail
```

---

## Package: `@devguard/javascript` (Future External Plugin)

**Purpose:** Advanced JavaScript/TypeScript checks with external tool integration

**Status:** 🔄 Structure exists, not currently used (checks are in core)

### Planned Features:

**External Tool Integration:**
- [ ] ESLint integration (use existing .eslintrc)
- [ ] TypeScript compiler integration
- [ ] Prettier integration
- [ ] Import/export validation

**Framework-Specific:**
- [ ] React hook dependency checks
- [ ] Vue composition API validation
- [ ] Svelte reactivity checks
- [ ] Angular dependency injection

### Structure:

```
packages/javascript/
├── src/
│   ├── checks/
│   │   ├── eslint-check.ts          # ESLint integration
│   │   ├── typescript-check.ts      # TS compiler integration
│   │   ├── react-hooks-check.ts     # React-specific
│   │   └── import-check.ts          # Import validation
│   └── index.ts                      # Plugin exports
├── package.json
└── README.md
```

### Future Usage:

```bash
npm install -D dev-guardrail @devguard/javascript
```

```yaml
# .devguard/config.yaml
plugins:
  - "@devguard/javascript"
```

---

## Package: `@devguard/php` (Future External Plugin)

**Purpose:** Advanced PHP checks with external tool integration

**Status:** 🔄 Structure exists, not currently used (checks are in core)

### Planned Features:

**External Tool Integration:**
- [ ] PHPStan integration (static analysis)
- [ ] PHP_CodeSniffer (PSR standards)
- [ ] Psalm integration
- [ ] PHP Mess Detector

**Framework-Specific:**
- [ ] Laravel N+1 query detection
- [ ] Laravel route security
- [ ] Symfony service validation
- [ ] WordPress hooks validation

### Structure:

```
packages/php/
├── src/
│   ├── checks/
│   │   ├── php-debug-check.ts       # Debug statements (copied from core)
│   │   ├── php-syntax-check.ts      # Syntax validation (copied from core)
│   │   ├── php-long-method-check.ts # Method complexity (copied from core)
│   │   ├── php-todo-check.ts        # TODO tracking (copied from core)
│   │   ├── phpstan-check.ts         # PHPStan integration (planned)
│   │   ├── phpcs-check.ts           # CodeSniffer integration (planned)
│   │   └── laravel-check.ts         # Laravel-specific (planned)
│   └── index.ts                      # Plugin exports
├── package.json
└── README.md
```

### Future Usage:

```bash
npm install -D dev-guardrail @devguard/php
```

```yaml
# .devguard/config.yaml
plugins:
  - "@devguard/php"
```

---

## Future Packages

### `@devguard/python`

**Purpose:** Python code quality

**Planned:**
- Pylint integration
- MyPy type checking
- Bandit security scanning
- Black formatting validation
- Django-specific checks
- Flask-specific checks

### `@devguard/go`

**Purpose:** Go code quality

**Planned:**
- go vet integration
- golint/staticcheck
- gosec security scanning
- go fmt validation

### `@devguard/rust`

**Purpose:** Rust code quality

**Planned:**
- cargo clippy integration
- rustfmt validation
- cargo audit security

### `@devguard/docker`

**Purpose:** Docker/container checks

**Planned:**
- Hadolint integration
- Dockerfile best practices
- Multi-stage build validation
- Security scanning

### `@devguard/security`

**Purpose:** Advanced security scanning

**Planned:**
- Semgrep integration
- Gitleaks secret scanning
- SAST tool integration
- Dependency vulnerability scanning

---

## Current vs. Future Architecture

### Current (v0.3.0):

```
dev-guardrail (core)
├── Universal checks
├── JavaScript checks (built-in)
└── PHP checks (built-in)
```

**Why?** Simple, zero-config, works out of the box.

### Future (v1.0+):

```
dev-guardrail (core)
├── Universal checks
├── Basic language checks (built-in)
└── Plugin loader

@devguard/javascript (optional)
└── Advanced JS checks + ESLint/TS integration

@devguard/php (optional)
└── Advanced PHP checks + PHPStan/PHPCS integration

@devguard/python (optional)
└── Python checks + tool integration

@devguard/security (optional)
└── Advanced security scanning
```

**Why?** Modular, extensible, keeps core lightweight, allows users to choose what they need.

---

## Adding a New Language Plugin

### Step 1: Create Package Structure

```bash
mkdir -p packages/newlang/src/checks
```

### Step 2: Create package.json

```json
{
  "name": "@devguard/newlang",
  "version": "0.1.0",
  "description": "NewLang plugin for DevGuard",
  "main": "./dist/index.js",
  "peerDependencies": {
    "@devguard/core": "^0.3.0"
  }
}
```

### Step 3: Create Checks

```typescript
// packages/newlang/src/checks/example-check.ts
import { BaseCheck, CheckResult, CheckContext, Category, Severity } from '@devguard/core';

export class ExampleCheck extends BaseCheck {
  name = 'newlang-example';
  category = Category.LINT;
  description = 'Example check for NewLang';

  async run(context: CheckContext): Promise<CheckResult> {
    const issues = [];
    const files = this.filterFiles(context.files, ['**/*.newlang']);
    
    // Check logic here
    
    return this.createResult(issues.length === 0, issues, 0);
  }
}
```

### Step 4: Create Plugin Export

```typescript
// packages/newlang/src/index.ts
import { Plugin } from '@devguard/core';
import { ExampleCheck } from './checks/example-check.js';

export const plugin: Plugin = {
  name: '@devguard/newlang',
  version: '0.1.0',
  description: 'NewLang quality checks',
  checks: [new ExampleCheck()],
  scoreWeight: 0.3,
};

export default plugin;
```

### Step 5: Update Core Detection

```typescript
// packages/core/src/detector/project-detector.ts
// Add detection logic for the new language
```

---

## Design Principles

### 1. **Core is Minimal**
- Universal checks that apply to all projects
- Basic built-in checks for immediate value
- No external dependencies (except Node.js built-ins)

### 2. **Plugins are Optional**
- Advanced features require explicit installation
- External tool integration is in plugins
- Users only install what they need

### 3. **Everything Works Out of the Box**
- No configuration required
- Smart defaults
- Auto-detection of project types

### 4. **Scalable Architecture**
- Easy to add new languages
- Clear separation of concerns
- Consistent API across plugins

### 5. **Performance First**
- Parallel check execution
- Efficient file scanning
- Caching where possible

---

## Package Dependencies

```
dev-guardrail (core)
  ↓ (used by all plugins)
  
@devguard/javascript ← depends on core
@devguard/php ← depends on core
@devguard/python ← depends on core
@devguard/security ← depends on core
```

**Rule:** Plugins never depend on each other, only on core.

---

## Publishing Strategy

### Phase 1 (Current - v0.3.0):
- ✅ Publish `dev-guardrail` only
- ✅ All checks built-in
- ✅ Works immediately

### Phase 2 (v0.4.0):
- Move advanced checks to plugins
- Keep basic checks in core
- Publish `@devguard/javascript`, `@devguard/php`

### Phase 3 (v0.5.0+):
- Add more language plugins
- Add security plugin
- Add framework-specific plugins

---

## Example: Adding Python Support

1. **Create** `packages/python/`
2. **Implement** checks:
   - `PylintCheck` (external tool)
   - `MyPyCheck` (type checking)
   - `BanditCheck` (security)
   - Basic syntax check (built-in)
3. **Update** core detector to recognize Python
4. **Publish** `@devguard/python`
5. **Document** usage

Result: Users can run `npm install -D dev-guardrail @devguard/python` for Python support.

---

## Summary

| Package | Status | Purpose | Dependencies |
|---------|--------|---------|--------------|
| `dev-guardrail` (core) | ✅ Published | Core + basic checks | None |
| `@devguard/javascript` | 🔄 Structure only | Advanced JS checks | core |
| `@devguard/php` | 🔄 Structure only | Advanced PHP checks | core |
| `@devguard/python` | ❌ Planned | Python support | core |
| `@devguard/security` | ❌ Planned | Security scanning | core |

**Current Focus:** Deliver value immediately with core package, prepare architecture for future expansion.

---

For implementation details, see:
- [Plugin Development Guide](./plugin-development.md)
- [Adding Custom Checks](./custom-rules.md)
- [Architecture Overview](./architecture.md)
