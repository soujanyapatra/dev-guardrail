# DevGuard

> Production-grade engineering quality platform - Alpha Release

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm](https://img.shields.io/npm/v/dev-guardrail.svg)](https://www.npmjs.com/package/dev-guardrail)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)

**Package:** `dev-guardrail` | **CLI:** `devguard`

## ⚠️ Alpha Status

DevGuard is in **alpha** (v0.1.x). The core framework is production-ready, but external tool integrations are in progress. See "What Works Now" below.

## Quick Start

```bash
# Install
npm install -D dev-guardrail

# Initialize
npx devguard init

# Run quality checks
npx devguard check
```

> **Note:** Use `npx devguard` for local installs, or install globally with `npm install -g dev-guardrail`

## What Works Now (v0.1.x)

✅ **Project Auto-Detection** - Identifies React, Vue, Next.js, Django, Laravel, and 15+ frameworks  
✅ **Plugin Architecture** - Extensible system for custom checks  
✅ **Scoring Engine** - Weighted quality scoring with categories  
✅ **Beautiful Terminal UI** - Progress bars and colored output  
✅ **Report Generation** - HTML, JSON, Markdown formats  
✅ **Git Hooks** - Pre-commit hook installation  
✅ **CI/CD Ready** - Works in GitHub Actions, GitLab CI, etc.  

## Native Checks (Built-in)

These checks work out of the box:
- **Console.log Detection** - Finds console.log/debugger statements
- **Large File Detection** - Identifies files >500 lines or >100KB  
- **TODO Detection** - Finds TODO/FIXME comments (optional)

## What's Coming (In Progress)

🔄 **External Tool Integration**:
- ESLint integration
- Prettier formatting checks
- TypeScript compiler integration
- Security scanning (Semgrep, Gitleaks)
- Test coverage analysis
- Dependency vulnerability scanning

🔄 **More Framework Support**:
- React-specific checks (hooks, props)
- Vue-specific checks
- Node.js best practices

## Auto-Detected Frameworks

DevGuard automatically detects:

**Frontend:** React, Vue, Nuxt, Next.js, Angular  
**Backend:** Node.js, Express, NestJS, Laravel, PHP, Python, Django, FastAPI, Flask  
**Mobile:** Flutter, React Native  

## CLI Commands
- Angular

### Backend
- Node.js
- Express
- NestJS
- Laravel
- PHP
- Python
- FastAPI
- Django

### Mobile
- Flutter
- React Native

### Coming Soon
- Go
- Rust
- Java (Spring Boot)
- .NET

## Architecture

DevGuard uses a modular plugin architecture:

```
devguard (core)
├── @devguard/javascript
├── @devguard/typescript
├── @devguard/react
├── @devguard/vue
├── @devguard/node
├── @devguard/python
├── @devguard/php
├── @devguard/docker
├── @devguard/security
└── @devguard/testing
```

## CLI Commands

```bash
devguard init              # Initialize DevGuard in your project
devguard check             # Run all quality checks
devguard doctor            # Diagnose setup issues
devguard score             # Show quality score
devguard report            # Generate detailed report
devguard fix               # Auto-fix issues where possible
devguard review            # AI-powered code review
devguard ci                # Run in CI mode
devguard hooks install     # Install Git hooks
devguard plugins list      # List available plugins
devguard update            # Update DevGuard and plugins
```

## Quality Checks

DevGuard orchestrates industry-standard tools:

- **Formatting**: Prettier
- **Linting**: ESLint, PHPStan, Pylint
- **Type Safety**: TypeScript, MyPy
- **Security**: Semgrep, Bandit
- **Secrets**: Gitleaks
- **Dependencies**: npm audit, Safety
- **Dead Code**: ts-prune
- **Complexity**: Plato
- **Architecture**: Dependency Cruiser
- **Coverage**: Vitest, Jest, PHPUnit
- **Docker**: Hadolint
- **YAML**: yamllint
- **Markdown**: markdownlint

Plus native DevGuard checks:
- Console log detection
- TODO/FIXME detection
- Hardcoded credentials
- Large files/functions
- Circular imports
- Naming conventions
- And more...

## Scoring

Every check contributes to your overall engineering quality score:

```
Overall Score: 92% (Grade A)
───────────────────────────
Security      95% ████████████████████
Type Safety   90% ██████████████████
Linting       88% █████████████████
Coverage      85% █████████████████
Complexity    92% ██████████████████
Architecture  89% ██████████████████
```

## Configuration

DevGuard generates `.devguard/config.yaml`:

```yaml
quality:
  minimumScore: 85

lint:
  enabled: true
security:
  enabled: true
coverage:
  enabled: true
complexity:
  enabled: true
```

## Plugin Development

Create custom plugins:

```typescript
import { Plugin } from '@devguard/core';

export const myPlugin: Plugin = {
  name: 'my-custom-plugin',
  version: '1.0.0',
  checks: [
    // Define custom checks
  ],
  rules: [
    // Define custom rules
  ],
  scoreWeight: 0.1
};
```

## CI Integration

Generate CI configuration:

```bash
devguard ci --platform github
devguard ci --platform gitlab
devguard ci --platform jenkins
```

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md)

## License

MIT © DevGuard Contributors

---

**Star us on GitHub!** ⭐
