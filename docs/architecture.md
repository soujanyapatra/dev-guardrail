# DevGuard Architecture

## Overview

DevGuard is built on a modular plugin architecture that orchestrates multiple code quality tools under a unified interface.

## Core Components

### 1. Core Package (`dev-guardrail`)

The foundation providing:

- **CLI Interface**: Command-line tool for running checks
- **Configuration Management**: Load and manage user configuration
- **Plugin System**: Register and manage plugins (architecture ready, expandable)
- **Scanner**: Orchestrate check execution in parallel
- **Scoring Engine**: Calculate overall quality scores
- **Project Detector**: Auto-detect project types and languages
- **Report Generator**: Generate HTML, JSON, Markdown reports

### 2. Plugin System

Currently there is **one plugin**:

**`@devguard/native`** - Built-in checks (no installation needed)
  - Includes all 7 native checks (3 for JS/TS, 4 for PHP)
  - No additional installation required
  - Automatically registered in the core package

The plugin architecture is ready for extension:

```typescript
interface Plugin {
  name: string;
  version: string;
  description?: string;
  checks: Check[];
  rules?: Rule[];
  scoreWeight?: number;
}
```

You can create custom plugins by implementing this interface. See [Plugin Development Guide](./plugin-development.md) for details.

### 3. Checks (Currently Implemented)

**JavaScript/TypeScript Checks:**
- **ConsoleLogCheck** - Detects console.log/debugger statements
- **LargeFileCheck** - Identifies files >500 lines or >100KB
- **TodoCheck** - Finds TODO/FIXME comments (optional)

**PHP Checks:**
- **PHPDebugCheck** - Detects dd(), dump(), var_dump(), print_r()
- **PHPSyntaxCheck** - Validates PHP syntax using `php -l`
- **PHPLongMethodCheck** - Detects methods >50 lines
- **PHPTodoCheck** - Finds TODO/FIXME in PHP files

All checks implement the `Check` interface:

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

## What's Built (v0.2.0)

### ✅ Core Package (`dev-guardrail`)

**Fully Functional:**
- CLI with 7 commands
- Configuration system (YAML/JSON)
- Plugin architecture
- Project detection (15+ frameworks)
- Scoring engine
- Report generation (HTML, JSON, Markdown)
- Git hooks
- CI/CD integration

### ✅ Native Checks

**7 Checks Implemented:**

**JavaScript/TypeScript:**
1. Console.log detection
2. Large file detection
3. TODO/FIXME detection

**PHP:**
4. Debug statement detection (dd, dump, var_dump)
5. Syntax validation
6. Long method detection
7. TODO/FIXME detection

### 🔄 Future Expansion

The plugin architecture is ready for adding:
- External linter integrations (ESLint, PHPStan)
- Framework-specific checks (React, Vue, Laravel)
- Security scanning tools
- Test coverage analysis
- Custom organizational checks

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

- **Language**: TypeScript 5.3 (strict mode)
- **Runtime**: Node.js 18+
- **CLI**: Commander.js
- **Config**: Cosmiconfig (YAML/JSON)
- **Terminal UI**: Chalk, Ora
- **Testing**: Vitest
- **Build**: TypeScript compiler
- **Monorepo**: npm workspaces

## Current Capabilities (v0.2.0)

### What Works Today
✅ Multi-language support (JavaScript, TypeScript, PHP)
✅ 7 native quality checks
✅ Intelligent quality scoring system
✅ Beautiful HTML/JSON/Markdown reports
✅ CI/CD integration ready
✅ Git pre-commit hooks
✅ Extensible plugin architecture

### Perfect For
- Laravel + Vue/React projects (checks both PHP and JS)
- Node.js applications
- Full-stack JavaScript/TypeScript projects
- Any project needing code quality monitoring
