# @devguard/php

> PHP quality and security checks for DevGuard

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Status:** Integrated into `dev-guardrail` core (no separate installation needed)

## What This Plugin Does

Provides comprehensive PHP code quality and security checks:

### Checks Included

1. **PHPDebugCheck** - Detects debug statements
   - `dd()`, `dump()` (Laravel)
   - `var_dump()`, `print_r()` (PHP)
   - `var_export()`, `error_log()`

2. **PHPSyntaxCheck** - Real-time syntax validation
   - Uses `php -l` to catch syntax errors
   - Prevents broken code from being committed

3. **PHPLongMethodCheck** - Method complexity
   - Flags methods >50 lines
   - Encourages proper code organization

4. **PHPTodoCheck** - TODO/FIXME tracking (optional)
   - Finds TODO, FIXME, HACK comments
   - Helps track technical debt

## Supported Frameworks

- ✅ **Laravel** - Full support including Blade templates
- ✅ **Symfony** - All PHP files
- ✅ **WordPress** - Plugin and theme development
- ✅ **Drupal** - Module development
- ✅ **CodeIgniter** - Full support
- ✅ **Pure PHP** - Any PHP project

## File Types Checked

- `.php` - All PHP files (Models, Controllers, Services, Routes, Migrations, Config)
- `.blade.php` - Laravel Blade templates

## Usage

This plugin is **automatically loaded** when you install `dev-guardrail` and have a PHP project:

```bash
npm install -D dev-guardrail
npx devguard check
```

DevGuard auto-detects PHP projects and enables PHP checks automatically.

## Configuration

Customize in `.devguard/config.yaml`:

```yaml
checks:
  # PHP Debug Statements
  phpDebug:
    enabled: true
    
  # PHP Syntax Validation
  phpSyntax:
    enabled: true
    
  # Long Method Detection
  phpLongMethod:
    enabled: true
    maxLines: 50
    
  # TODO Comments (optional)
  todoCheck:
    enabled: false
```

## Example Output

```bash
$ npx devguard check

PHP project detected - enabling PHP checks
──────────────────────────────────

⚠️ Found debug statement: dd() [no-debug-statements]
app/Http/Controllers/UserController.php:45
💡 Remove dd() before committing to production

⚠️ Method 'processPayment' is too long (67 lines) [max-method-length]
app/Services/PaymentService.php:89
💡 Consider splitting this method into smaller methods (max 50 lines)

❌ PHP syntax error [php-syntax]
app/Models/User.php:142
💡 Fix the syntax error in this file
```

## Architecture

```
@devguard/php/
├── src/
│   ├── checks/
│   │   ├── php-debug-check.ts      # Debug statement detection
│   │   ├── php-syntax-check.ts     # Syntax validation
│   │   ├── php-long-method-check.ts # Method length
│   │   └── php-todo-check.ts       # TODO/FIXME tracking
│   └── index.ts                     # Plugin exports
├── package.json
└── README.md
```

## Future Enhancements

Planned features for future releases:

- [ ] **PHPStan Integration** - Static analysis
- [ ] **PHP_CodeSniffer** - PSR standards enforcement
- [ ] **Laravel-Specific Checks**:
  - [ ] Eloquent N+1 query detection
  - [ ] Missing validation rules
  - [ ] Route security checks
  - [ ] Middleware usage validation
- [ ] **Security Checks** (currently in core):
  - [x] SQL injection detection
  - [x] XSS vulnerabilities
  - [x] Command injection
  - [x] Weak password hashing
- [ ] **Complexity Analysis**:
  - [ ] Cyclomatic complexity
  - [ ] Cognitive complexity
  - [ ] Dependency analysis

## Contributing

Want to add more PHP checks? See [Contributing Guide](../../CONTRIBUTING.md).

## License

MIT © DevGuard Contributors

## Related Packages

- [`dev-guardrail`](https://www.npmjs.com/package/dev-guardrail) - Core package
- [`@devguard/javascript`](../javascript) - JavaScript/TypeScript checks

---

**Made with ❤️ for PHP developers**
