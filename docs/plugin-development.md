# Plugin Development Guide

## Creating a DevGuard Plugin

Plugins extend DevGuard with custom checks for specific languages, frameworks, or tools.

## Plugin Structure

```
@devguard/my-plugin/
├── src/
│   ├── checks/
│   │   ├── my-check.ts
│   │   └── another-check.ts
│   ├── rules/
│   │   └── custom-rules.ts
│   └── index.ts
├── package.json
├── tsconfig.json
└── README.md
```

## Basic Plugin

```typescript
// src/index.ts
import { Plugin } from '@devguard/core';
import { MyCheck } from './checks/my-check.js';

export const plugin: Plugin = {
  name: '@devguard/my-plugin',
  version: '1.0.0',
  description: 'My custom DevGuard plugin',
  checks: [
    new MyCheck(),
  ],
  scoreWeight: 0.1,
};

export default plugin;
```

## Creating a Check

```typescript
// src/checks/my-check.ts
import {
  BaseCheck,
  CheckResult,
  CheckContext,
  Category,
  Severity,
  FileSystem,
} from '@devguard/core';

export class MyCheck extends BaseCheck {
  name = 'my-check';
  category = Category.LINT;
  description = 'My custom quality check';

  async run(context: CheckContext): Promise<CheckResult> {
    // Use measureTime helper for timing
    const [issues, duration] = await this.measureTime(async () => {
      const issues = [];

      // Filter files to check
      const files = this.filterFiles(context.files, ['**/*.js', '**/*.ts']);

      for (const file of files) {
        const fullPath = FileSystem.join(context.projectPath, file);
        const content = await FileSystem.readFile(fullPath);

        // Your check logic
        if (content.includes('bad-pattern')) {
          issues.push(
            this.createIssue({
              severity: Severity.WARNING,
              category: this.category,
              message: 'Found bad pattern',
              file,
              line: 1,
              rule: 'no-bad-pattern',
              suggestion: 'Replace with good pattern',
            })
          );
        }
      }

      return issues;
    });

    return this.createResult(issues.length === 0, issues, duration);
  }
}
```

## Plugin Lifecycle

```typescript
export const plugin: Plugin = {
  name: '@devguard/my-plugin',
  version: '1.0.0',
  checks: [],

  // Called when plugin is registered
  async initialize(context: PluginContext) {
    console.log('Plugin initialized');
    // Setup tasks (install dependencies, verify tools, etc.)
  },

  // Called when plugin is unregistered
  async cleanup() {
    console.log('Plugin cleaned up');
    // Cleanup tasks (close connections, remove temp files, etc.)
  },
};
```

## Advanced Patterns

### Integrating External Tools

```typescript
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class ExternalToolCheck extends BaseCheck {
  name = 'external-tool';
  category = Category.LINT;
  description = 'Integrates with external tool';

  async run(context: CheckContext): Promise<CheckResult> {
    const [issues, duration] = await this.measureTime(async () => {
      try {
        const { stdout } = await execAsync('some-tool --format json', {
          cwd: context.projectPath,
        });

        const results = JSON.parse(stdout);
        return this.convertToIssues(results);
      } catch (error) {
        // Tool not installed or failed
        return [];
      }
    });

    return this.createResult(issues.length === 0, issues, duration);
  }

  private convertToIssues(results: unknown[]): Issue[] {
    // Convert tool-specific format to DevGuard issues
    return [];
  }
}
```

### Using Context Cache

```typescript
export class CachedCheck extends BaseCheck {
  name = 'cached-check';
  category = Category.LINT;
  description = 'Uses caching for performance';

  async run(context: CheckContext): Promise<CheckResult> {
    // Check cache
    const cacheKey = 'my-expensive-data';
    let data = context.cache.get(cacheKey);

    if (!data) {
      // Compute expensive data
      data = await this.computeExpensiveData(context);
      context.cache.set(cacheKey, data);
    }

    // Use cached data
    return this.processData(data);
  }
}
```

### Conditional Checks

```typescript
export class ConditionalCheck extends BaseCheck {
  name = 'conditional-check';
  category = Category.LINT;
  description = 'Only runs in certain conditions';

  shouldRun(context: CheckContext): boolean {
    // Only run for TypeScript projects
    return context.projectType.includes('typescript');
  }

  async run(context: CheckContext): Promise<CheckResult> {
    // Check logic
  }
}
```

## Custom Rules

```typescript
// src/rules/custom-rules.ts
import { Rule, Category, Severity } from '@devguard/core';

export const noMagicNumbers: Rule = {
  id: 'no-magic-numbers',
  category: Category.LINT,
  severity: Severity.WARNING,
  message: 'Avoid magic numbers',
  pattern: /\b\d{4,}\b/,
};

export const noHardcodedUrls: Rule = {
  id: 'no-hardcoded-urls',
  category: Category.SECURITY,
  severity: Severity.WARNING,
  message: 'Avoid hardcoded URLs',
  pattern: /https?:\/\/[^\s]+/,
  check(file: string, content: string) {
    const issues = [];
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      if (this.pattern?.test(line)) {
        issues.push({
          id: `${this.id}-${index}`,
          severity: this.severity,
          category: this.category,
          message: this.message,
          file,
          line: index + 1,
          rule: this.id,
          suggestion: 'Use environment variables for URLs',
        });
      }
    });

    return issues;
  },
};
```

## Package.json

```json
{
  "name": "@devguard/my-plugin",
  "version": "1.0.0",
  "description": "My DevGuard plugin",
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "keywords": ["devguard", "plugin", "quality"],
  "peerDependencies": {
    "@devguard/core": "^0.1.0"
  },
  "dependencies": {
    "@devguard/core": "^0.1.0"
  }
}
```

## Testing

```typescript
// src/checks/__tests__/my-check.test.ts
import { describe, it, expect } from 'vitest';
import { MyCheck } from '../my-check.js';
import { CheckContext, Category } from '@devguard/core';

describe('MyCheck', () => {
  it('should detect issues', async () => {
    const check = new MyCheck();
    const context: CheckContext = {
      projectPath: '/test',
      projectType: ['javascript'],
      config: {} as any,
      files: ['test.js'],
      cache: new Map(),
    };

    const result = await check.run(context);
    expect(result.issues.length).toBeGreaterThan(0);
  });
});
```

## Publishing

```bash
# Build
npm run build

# Test
npm test

# Publish to npm
npm publish
```

## Best Practices

1. **Keep checks focused** - One check, one responsibility
2. **Use helpers** - Leverage `BaseCheck` utilities
3. **Handle errors gracefully** - Don't crash on missing dependencies
4. **Cache expensive operations** - Use context cache
5. **Write tests** - Aim for 95%+ coverage
6. **Document thoroughly** - Clear descriptions and examples
7. **Follow conventions** - Use standard category/severity
8. **Optimize performance** - Parallel processing, minimal I/O

## Example: Native Plugin

The `@devguard/native` plugin (built into core) demonstrates the plugin pattern:

- 7 checks (3 for JS/TS, 4 for PHP)
- Multiple categories (LINT, COMPLEXITY)
- Auto-registration in core package

See `packages/core/src/devguard.ts` for implementation.
