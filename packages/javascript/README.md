# @devguard/javascript

> JavaScript/TypeScript quality and security checks for DevGuard

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Status:** Integrated into `dev-guardrail` core (no separate installation needed)

## What This Plugin Does

Provides comprehensive JavaScript/TypeScript code quality and security checks:

### Checks Included

1. **ConsoleLogCheck** - Debug statement detection
   - `console.log()`, `console.debug()`, etc.
   - `debugger` statements

2. **ErrorHandlingCheck** - Exception management
   - Empty catch blocks
   - Unhandled promises
   - Missing try-catch in async
   - Throwing strings vs Error objects

3. **NamingConventionCheck** - Code style
   - PascalCase for classes
   - camelCase for functions
   - Proper constant naming
   - Hungarian notation detection

4. **SecretDetectionCheck** - Security (in core)
   - API keys and tokens
   - Hardcoded passwords
   - AWS keys, GitHub tokens
   - JWT tokens

5. **SecurityPatternCheck** - Vulnerabilities (in core)
   - XSS (innerHTML, dangerouslySetInnerHTML)
   - eval() usage
   - SQL injection patterns
   - localStorage with sensitive data
   - Open redirects

## Supported Frameworks

- ✅ **React** - `.jsx`, `.tsx` components
- ✅ **Vue.js** - `.vue` single file components
- ✅ **Svelte** - `.svelte` components
- ✅ **Angular** - `.ts` files
- ✅ **Next.js** - All React file types
- ✅ **Nuxt** - `.vue` files
- ✅ **Node.js** - All JS/TS files
- ✅ **Express/NestJS** - Backend frameworks

## File Types Checked

- `.js`, `.mjs`, `.cjs` - JavaScript (all variants)
- `.ts` - TypeScript
- `.jsx`, `.tsx` - React components
- `.vue` - Vue.js components
- `.svelte` - Svelte components

## Usage

This plugin is **automatically loaded** when you install `dev-guardrail`:

```bash
npm install -D dev-guardrail
npx devguard check
```

## Configuration

Customize in `.devguard/config.yaml`:

```yaml
checks:
  # Console Logs
  consoleLog:
    enabled: true
    
  # Error Handling
  errorHandling:
    enabled: true
    
  # Naming Conventions
  namingConvention:
    enabled: true
    severity: warning
    
  # Security Patterns
  securityPatterns:
    enabled: true
```

## Example Output

```bash
$ npx devguard check

──────────────────────────────────

⚠️ Found console.log statement [no-console]
src/components/Dashboard.vue:142
💡 Remove console statements or use a proper logging library

⚠️ Empty catch block - errors are silently swallowed [no-empty-catch]
src/services/api.ts:67
💡 Log the error or handle it appropriately

⚠️ Using dangerouslySetInnerHTML - ensure content is sanitized [dangerous-html]
src/components/RichText.tsx:23
💡 Only use with sanitized content (e.g., DOMPurify)

🔐 Potential hardcoded API Key detected [no-secrets]
src/config/api.ts:5
💡 Use environment variables instead
```

## Architecture

```
@devguard/javascript/
├── src/
│   ├── checks/
│   │   ├── eslint-check.ts         # ESLint integration (planned)
│   │   └── typescript-check.ts     # TypeScript compiler (planned)
│   └── index.ts                     # Plugin exports
├── package.json
└── README.md
```

## Future Enhancements

Planned features for future releases:

- [ ] **ESLint Integration** - Leverage existing ESLint configs
- [ ] **TypeScript Compiler** - Type checking integration
- [ ] **React-Specific Checks**:
  - [ ] Hook dependency validation
  - [ ] Prop-types validation
  - [ ] Component performance (memo usage)
  - [ ] Accessibility checks
- [ ] **Vue-Specific Checks**:
  - [ ] Composition API best practices
  - [ ] Reactivity pitfalls
  - [ ] Props validation
- [ ] **Import Analysis**:
  - [ ] Circular dependencies
  - [ ] Unused imports
  - [ ] Import order validation
- [ ] **Performance Checks**:
  - [ ] Large bundle detection
  - [ ] Synchronous operations
  - [ ] Memory leak patterns

## Current Coverage

**What Works Now (in core):**
- ✅ Console.log detection
- ✅ Debugger detection
- ✅ Error handling validation
- ✅ Naming conventions
- ✅ Secret detection (20+ patterns)
- ✅ Security vulnerabilities (XSS, eval, etc.)
- ✅ Large file detection (>700 lines)

**What's Planned:**
- 🔄 ESLint integration
- 🔄 TypeScript compiler integration
- 🔄 Framework-specific checks

## Contributing

Want to add more JavaScript checks? See [Contributing Guide](../../CONTRIBUTING.md).

## License

MIT © DevGuard Contributors

## Related Packages

- [`dev-guardrail`](https://www.npmjs.com/package/dev-guardrail) - Core package
- [`@devguard/php`](../php) - PHP checks

---

**Made with ❤️ for JavaScript developers**
