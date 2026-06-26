# DevGuard Architecture

## Overview

DevGuard is built on a modular plugin architecture that orchestrates multiple code quality tools under a unified interface.

## Core Components

### 1. Core Package (`@devguard/core`)

The foundation of DevGuard providing:

- **CLI Interface**: Command-line tool for running checks
- **Configuration Management**: Load and manage user configuration
- **Plugin System**: Register and manage plugins
- **Scanner**: Orchestrate check execution
- **Scoring Engine**: Calculate overall quality scores
- **Project Detector**: Auto-detect project types
- **Report Generator**: Generate multiple report formats

### 2. Plugin System

Plugins extend DevGuard with language or framework-specific checks:

```typescript
interface Plugin {
  name: string;
  version: string;
  description?: string;
  checks: Check[];
  rules?: Rule[];
  scoreWeight?: number;
  initialize?(context: PluginContext): Promise<void>;
  cleanup?(): Promise<void>;
}
```

#### Official Plugins

- `@devguard/javascript` - ESLint, TypeScript, Prettier
- `@devguard/react` - React-specific checks
- `@devguard/vue` - Vue-specific checks
- `@devguard/node` - Node.js security and best practices
- `@devguard/python` - Pylint, MyPy, Bandit
- `@devguard/php` - PHPStan, PHP_CodeSniffer
- `@devguard/docker` - Hadolint
- `@devguard/security` - Semgrep, secret scanning
- `@devguard/testing` - Coverage checks

### 3. Checks

Checks are individual quality validations:

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

#### Check Categories

- `LINT` - Code style and quality
- `SECURITY` - Security vulnerabilities
- `TYPE_SAFETY` - Type checking
- `COMPLEXITY` - Code complexity
- `COVERAGE` - Test coverage
- `ARCHITECTURE` - Dependency management
- `PERFORMANCE` - Performance issues
- `DOCUMENTATION` - Documentation completeness
- `FORMATTING` - Code formatting
- `TESTING` - Test quality

### 4. Scoring Engine

Calculates weighted scores based on check results:

```typescript
const DEFAULT_WEIGHTS = {
  SECURITY: 0.20,        // 20%
  TYPE_SAFETY: 0.15,     // 15%
  LINT: 0.15,            // 15%
  COVERAGE: 0.10,        // 10%
  ARCHITECTURE: 0.10,    // 10%
  COMPLEXITY: 0.10,      // 10%
  PERFORMANCE: 0.05,     // 5%
  DOCUMENTATION: 0.05,   // 5%
  FORMATTING: 0.05,      // 5%
  TESTING: 0.05,         // 5%
};
```

### 5. Project Detector

Automatically detects:

- Project type (frontend, backend, mobile)
- Programming languages
- Frameworks (React, Vue, Django, Laravel, etc.)
- Package manager (npm, yarn, pnpm, pip, composer)
- Test setup
- Docker usage
- CI configuration

## Data Flow

```
User runs CLI command
    ↓
CLI parses arguments
    ↓
DevGuard initializes
    ↓
ConfigManager loads config
    ↓
ProjectDetector analyzes project
    ↓
PluginManager loads plugins
    ↓
Scanner collects files
    ↓
Scanner runs checks (parallel)
    ↓
ScoringEngine calculates score
    ↓
ReportGenerator creates output
    ↓
Results displayed to user
```

## Extension Points

### Custom Plugins

Create third-party plugins:

```typescript
import { Plugin, BaseCheck } from '@devguard/core';

export const myPlugin: Plugin = {
  name: '@company/devguard-custom',
  version: '1.0.0',
  checks: [new MyCustomCheck()],
};
```

### Custom Checks

Extend `BaseCheck` for custom validations:

```typescript
import { BaseCheck } from '@devguard/core';

export class MyCheck extends BaseCheck {
  name = 'my-check';
  category = Category.LINT;
  description = 'My custom check';

  async run(context: CheckContext): Promise<CheckResult> {
    // Implementation
  }
}
```

### Custom Rules

Define rules without creating a full check:

```typescript
const rule: Rule = {
  id: 'no-magic-numbers',
  category: Category.LINT,
  severity: Severity.WARNING,
  message: 'Avoid magic numbers',
  pattern: /\d{4,}/,
};
```

## Performance Considerations

### Caching

- File content cached per scan
- Check results cached when possible
- Configuration cached after load

### Parallelization

- Checks run concurrently (default: 5 concurrent)
- File operations use async I/O
- Large projects use streaming

### Incremental Mode

- Only scan changed files (Git diff)
- Reuse previous results for unchanged files
- Fast feedback in development

## Technology Stack

- **Language**: TypeScript (strict mode)
- **Runtime**: Node.js 18+
- **CLI**: Commander.js
- **Config**: Cosmiconfig
- **Terminal UI**: Chalk, Ora
- **Testing**: Vitest
- **Build**: Turbo (monorepo)
- **Package Manager**: npm workspaces

## Design Principles

1. **Zero Configuration**: Works out of the box
2. **Extensibility**: Plugin architecture for customization
3. **Performance**: Fast scans through parallelization
4. **Reliability**: Comprehensive test coverage
5. **User Experience**: Clear feedback and beautiful output
6. **Integration**: Easy CI/CD integration
7. **Standards**: Follow industry best practices
8. **Open Source**: Transparent and community-driven
