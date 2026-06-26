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

dev-guardrail checks your code for common issues and gives you a quality score with detailed insights.

### JavaScript/TypeScript Checks
- 🔍 Finds `console.log()` and `debugger` statements
- 📏 Detects large files (>500 lines or >100KB)
- 📝 Flags TODO/FIXME comments

### PHP Checks  
- 🐛 Finds debug statements (`dd()`, `dump()`, `var_dump()`, `print_r()`)
- ✅ Validates PHP syntax
- 📏 Detects long methods (>50 lines)
- 📝 Flags TODO/FIXME comments in PHP

## Supported Languages

- ✅ JavaScript (`.js`, `.jsx`)
- ✅ TypeScript (`.ts`, `.tsx`)
- ✅ PHP (`.php`)

Perfect for:
- **Laravel + Vue** projects
- **Laravel + React** projects
- **Pure PHP** projects
- **Pure JavaScript/TypeScript** projects

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

Console Logs     95% ████████████████████
File Size        88% █████████████████
Debug Code       82% ████████████████
Method Length    90% ██████████████████

──────────────────────────────────
Issues Found
──────────────────────────────────

3 Errors:
  Found debug statement: dd() [no-debug-statements]
  app/Http/Controllers/UserController.php:45
  💡 Remove dd() before committing to production

  Found debug statement: var_dump() [no-debug-statements]
  app/Models/User.php:128
  💡 Remove var_dump() before committing to production

5 Warnings:
  Method 'processUserData' is too long (67 lines) [max-method-length]
  app/Services/UserService.php:89
  💡 Consider splitting this method into smaller methods (max 50 lines)

  Found console.log statement [no-console]
  resources/js/components/Dashboard.vue:142
  💡 Remove console statements or use a proper logging library

──────────────────────────────────
Files Scanned: 156
Duration: 2.3s
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
