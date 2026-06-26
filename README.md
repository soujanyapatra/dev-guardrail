# DevGuard

> Production-grade engineering quality platform for modern development teams

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)

## Quick Start

```bash
# Install
npm install -D devguard

# Initialize
npx devguard init

# Run quality checks
devguard check
```

That's it! DevGuard automatically detects your project type, installs required dependencies, and runs comprehensive quality checks.

## Features

✅ **Zero Configuration** - Works out of the box for 15+ frameworks  
✅ **Comprehensive Checks** - Linting, security, testing, complexity, and more  
✅ **Quality Scoring** - Get an overall engineering health score  
✅ **AI-Powered Reviews** - Intelligent recommendations for improvements  
✅ **Git Hook Integration** - Automatic pre-commit and pre-push hooks  
✅ **Beautiful Reports** - HTML, JSON, Markdown, and PDF outputs  
✅ **CI/CD Ready** - Templates for all major CI platforms  
✅ **Extensible** - Plugin architecture for custom checks  

## Supported Technologies

### Frontend
- React
- Vue
- Nuxt
- Next.js
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
