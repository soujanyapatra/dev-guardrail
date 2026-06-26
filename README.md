# dev-guardrail

> Code quality checks for JavaScript, TypeScript, and PHP projects

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

Works on pure JS/TS projects, PHP projects, or mixed Laravel + Vue/React projects!

## What It Does

dev-guardrail performs deep code analysis for quality, security, and best practices - finding issues that matter before they hit production.

### 🔒 Security Checks (Critical)
- **Secret Detection**: Finds exposed API keys, passwords, tokens, AWS keys, database credentials
- **SQL Injection**: Detects unsafe database queries and string concatenation
- **XSS Vulnerabilities**: Identifies unescaped output and dangerous HTML injection
- **Command Injection**: Flags unsafe shell command execution
- **Weak Cryptography**: Detects md5/sha1 for passwords, improper hashing

### 📋 Code Quality Checks

**JavaScript/TypeScript:**
- Debug statements (`console.log`, `debugger`)
- Large files (>700 lines or >100KB)
- Error handling (missing try-catch, empty catch blocks, unhandled promises)
- Naming conventions (PascalCase, camelCase, Hungarian notation)
- Security patterns (eval, innerHTML, localStorage with secrets)

**PHP:**
- Debug statements (`dd()`, `dump()`, `var_dump()`, `print_r()`)
- Syntax validation (real-time PHP syntax checking)
- Long methods (>50 lines)
- Error handling (empty catch blocks, error suppression with @)
- Naming conventions (PSR-1 compliance)
- Security patterns (SQL injection, XSS, command injection, unsafe unserialize)

### 📝 Optional Checks
- TODO/FIXME comments (can be enabled in config)

## Supported Languages

**JavaScript/TypeScript:**
- ✅ `.js`, `.mjs`, `.cjs` - JavaScript (all variants)
- ✅ `.ts` - TypeScript
- ✅ `.jsx`, `.tsx` - React components
- ✅ `.vue` - Vue.js components
- ✅ `.svelte` - Svelte components

**PHP:**
- ✅ `.php` - PHP files (Models, Controllers, Services, Routes, Migrations, etc.)
- ✅ `.blade.php` - Laravel Blade templates

Perfect for:
- **Laravel + Vue/React** projects (checks both backend and frontend)
- **Laravel + Inertia.js** projects
- **MERN/MEVN** stack applications
- **Svelte/SvelteKit** projects
- **Pure PHP** projects (WordPress, Drupal, Symfony, etc.)
- **Pure JavaScript/TypeScript** projects
- **Monorepos** with multiple tech stacks

## Example Output

```bash
$ npx devguard check

dev-guardrail - Quality Scan
──────────────────────────────────

Detecting: Laravel + Vue
Languages: PHP, JavaScript
──────────────────────────────────

Overall Score: 88% (Grade B+)
──────────────────────────────────

Quality Breakdown:

Security         92% ███████████████████
Lint            88% █████████████████
Complexity      85% ████████████████
Type Safety     90% ██████████████████

──────────────────────────────────
Issues Found
──────────────────────────────────

5 Errors:
  🔐 Potential hardcoded API Key detected [no-secrets]
  app/Services/PaymentService.php:23
  💡 Use environment variables or a secrets manager instead of hardcoding credentials
  
  ⚠️ Potential SQL injection - avoid string concatenation in queries [sql-injection]
  app/Repositories/UserRepository.php:145
  💡 Use parameter binding: DB::select("SELECT * FROM users WHERE id = ?", [$id])

  🛡️ Using md5 for passwords - insecure hashing algorithm [weak-password-hash]
  app/Auth/LegacyAuth.php:67
  💡 Use bcrypt: Hash::make($password) or password_hash()

8 Warnings:
  Found debug statement: dd() [no-debug-statements]
  app/Http/Controllers/UserController.php:45
  💡 Remove dd() before committing to production

  Method 'processPayment' is too long (67 lines) [max-method-length]
  app/Services/PaymentService.php:89
  💡 Consider splitting this method into smaller methods (max 50 lines)

  Found console.log statement [no-console]
  resources/js/components/Dashboard.vue:142
  💡 Remove console statements or use a proper logging library
  
  Empty catch block - exceptions are silently swallowed [no-empty-catch]
  app/Services/ApiClient.php:234
  💡 Log the exception or handle it appropriately

──────────────────────────────────
Files Scanned: 156
Duration: 2.8s
──────────────────────────────────

For full report: npx devguard report --format html
```

## CLI Commands

```bash
npx devguard init              # Initialize in your project
npx devguard check             # Run quality checks
npx devguard check --verbose   # Show all issues including info
npx devguard score             # Show quality score only
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
  phpDebug:
    enabled: true
  phpSyntax:
    enabled: true
  phpLongMethod:
    enabled: true
    maxLines: 50
```

## Reports

Generate detailed reports:

```bash
npx devguard report --format html       # Visual HTML report with charts
npx devguard report --format json       # Machine-readable JSON
npx devguard report --format markdown   # Markdown for docs
```

Reports include:
- Overall quality score and grade
- Issues by file with line numbers
- Suggestions for fixing each issue
- Category breakdowns
- Trend analysis

## Git Hooks

Automatically run checks before commits:

```bash
npx devguard hooks
```

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

Also works with GitLab CI, Jenkins, CircleCI, and all major CI platforms.

## Laravel Projects

dev-guardrail works great with Laravel! It will automatically:

1. **Detect Laravel** - Recognizes Laravel projects
2. **Check PHP code** - Validates controllers, models, services
3. **Check frontend code** - If you have Vue/React in `resources/js/`
4. **Give unified score** - Single quality score across all languages

**Example Laravel + Vue project:**
```
my-laravel-app/
├── app/
│   ├── Http/Controllers/  ← ✅ Checks PHP
│   └── Models/            ← ✅ Checks PHP
├── resources/
│   └── js/
│       ├── app.js        ← ✅ Checks JavaScript
│       └── components/   ← ✅ Checks Vue files
```

## Pure PHP Projects

Works perfectly on non-Laravel PHP projects too:

```bash
cd my-php-project
npm init -y
npm install -D dev-guardrail
npx devguard init
npx devguard check
```

Checks all `.php` files for quality issues!

## Use Cases

**For Developers:**
- Catch issues before code review
- Maintain consistent code quality
- Learn best practices from suggestions

**For Teams:**
- Enforce coding standards
- Prevent debug code in production
- Keep methods and files manageable
- Quality gates in CI/CD

**For Laravel Projects:**
- Check both backend (PHP) and frontend (JS/Vue)
- Unified quality metrics
- Catch common Laravel mistakes

## What Makes It Special

✨ **Multi-Language** - Works on both PHP and JavaScript in the same project  
✨ **Detailed Insights** - Shows exactly where issues are and how to fix them  
✨ **Zero Config** - Auto-detects Laravel, Vue, React, etc.  
✨ **Fast** - Scans 100+ files in seconds  
✨ **Actionable** - Every issue includes a suggestion  
✨ **CI/CD Ready** - Perfect for automated quality gates  

## Roadmap

**v0.3** - ESLint & Prettier integration  
**v0.4** - PHPStan integration  
**v0.5** - Security scanning (SQL injection, XSS)  
**v0.6** - Test coverage analysis  
**v1.0** - Production ready with full tool ecosystem

## Plugin Development

Build custom checks:

```typescript
import { Plugin, BaseCheck } from 'dev-guardrail';

export const myPlugin: Plugin = {
  name: 'my-plugin',
  version: '1.0.0',
  checks: [new MyCustomCheck()],
};
```

See [Plugin Development Guide](./docs/plugin-development.md)

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
