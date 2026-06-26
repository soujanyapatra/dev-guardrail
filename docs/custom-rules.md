# Custom Rules

DevGuard allows you to define custom rules for project-specific quality requirements.

## Rule Definition

Create `.devguard/rules/custom.ts`:

```typescript
import { Rule, Category, Severity, Issue } from '@devguard/core';

export const rules: Rule[] = [
  {
    id: 'no-magic-numbers',
    category: Category.LINT,
    severity: Severity.WARNING,
    message: 'Avoid magic numbers - use named constants',
    pattern: /\b\d{4,}\b/,
  },

  {
    id: 'no-hardcoded-urls',
    category: Category.SECURITY,
    severity: Severity.ERROR,
    message: 'Do not hardcode URLs - use environment variables',
    check(file: string, content: string): Issue[] {
      const issues: Issue[] = [];
      const lines = content.split('\n');
      const urlPattern = /https?:\/\/(?!localhost)[^\s'"]+/g;

      lines.forEach((line, index) => {
        const matches = line.matchAll(urlPattern);
        for (const match of matches) {
          issues.push({
            id: `${this.id}-${index}`,
            severity: this.severity,
            category: this.category,
            message: this.message,
            file,
            line: index + 1,
            rule: this.id,
            suggestion: 'Use process.env.API_URL or similar',
          });
        }
      });

      return issues;
    },
  },

  {
    id: 'require-jsdoc',
    category: Category.DOCUMENTATION,
    severity: Severity.WARNING,
    message: 'Public functions should have JSDoc comments',
    check(file: string, content: string): Issue[] {
      const issues: Issue[] = [];
      const lines = content.split('\n');

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Detect exported functions without JSDoc
        if (/export (function|const \w+ =)/.test(line)) {
          const prevLine = i > 0 ? lines[i - 1].trim() : '';
          if (!prevLine.startsWith('/**')) {
            issues.push({
              id: `${this.id}-${i}`,
              severity: this.severity,
              category: this.category,
              message: this.message,
              file,
              line: i + 1,
              rule: this.id,
              suggestion: 'Add JSDoc comment above function',
            });
          }
        }
      }

      return issues;
    },
  },
];
```

## Pattern-Based Rules

Simple regex patterns:

```typescript
{
  id: 'no-var',
  category: Category.LINT,
  severity: Severity.ERROR,
  message: 'Use const or let instead of var',
  pattern: /\bvar\s+/,
}
```

## Function-Based Rules

Complex logic:

```typescript
{
  id: 'max-function-length',
  category: Category.COMPLEXITY,
  severity: Severity.WARNING,
  message: 'Function is too long',
  check(file: string, content: string): Issue[] {
    const issues: Issue[] = [];
    const functions = extractFunctions(content);

    for (const func of functions) {
      if (func.lines > 50) {
        issues.push({
          id: `${this.id}-${func.line}`,
          severity: this.severity,
          category: this.category,
          message: `Function has ${func.lines} lines (max 50)`,
          file,
          line: func.line,
          rule: this.id,
          suggestion: 'Split into smaller functions',
        });
      }
    }

    return issues;
  },
}
```

## AST-Based Rules

Use TypeScript compiler API:

```typescript
import ts from 'typescript';

{
  id: 'no-any',
  category: Category.TYPE_SAFETY,
  severity: Severity.ERROR,
  message: 'Avoid using "any" type',
  check(file: string, content: string): Issue[] {
    const issues: Issue[] = [];
    const sourceFile = ts.createSourceFile(
      file,
      content,
      ts.ScriptTarget.Latest,
      true
    );

    function visit(node: ts.Node) {
      if (ts.isTypeReferenceNode(node)) {
        if (node.typeName.getText() === 'any') {
          const { line } = sourceFile.getLineAndCharacterOfPosition(
            node.getStart()
          );
          issues.push({
            id: `${this.id}-${line}`,
            severity: this.severity,
            category: this.category,
            message: this.message,
            file,
            line: line + 1,
            rule: this.id,
          });
        }
      }
      ts.forEachChild(node, visit);
    }

    visit(sourceFile);
    return issues;
  },
}
```

## Rule Configuration

Enable custom rules in `.devguard/config.yaml`:

```yaml
checks:
  customRules:
    enabled: true
    options:
      rulesDir: ".devguard/rules"
      rules:
        - no-magic-numbers
        - no-hardcoded-urls
        - require-jsdoc
```

## Rule Severity

Override severity per rule:

```yaml
checks:
  customRules:
    enabled: true
    options:
      severityOverrides:
        no-magic-numbers: info
        no-hardcoded-urls: error
```

## Disabling Rules

Disable inline:

```typescript
// devguard-disable-next-line no-magic-numbers
const PORT = 3000;

// devguard-disable no-hardcoded-urls
const API_URL = 'https://api.example.com';
// devguard-enable no-hardcoded-urls
```

Disable in config:

```yaml
checks:
  customRules:
    enabled: true
    options:
      disable:
        - no-magic-numbers
```

## File-Specific Rules

```yaml
checks:
  customRules:
    enabled: true
    options:
      overrides:
        - files: "**/*.test.ts"
          rules:
            require-jsdoc: off
        - files: "src/config/**"
          rules:
            no-hardcoded-urls: off
```

## Example Rules

### No Deprecated APIs

```typescript
{
  id: 'no-deprecated-api',
  category: Category.LINT,
  severity: Severity.WARNING,
  message: 'Do not use deprecated API',
  check(file, content) {
    const deprecated = [
      'oldFunction',
      'legacyMethod',
      'deprecatedUtil',
    ];
    const issues = [];

    deprecated.forEach(api => {
      const regex = new RegExp(`\\b${api}\\b`, 'g');
      const lines = content.split('\n');
      
      lines.forEach((line, i) => {
        if (regex.test(line)) {
          issues.push({
            id: `${this.id}-${i}`,
            severity: this.severity,
            category: this.category,
            message: `${api} is deprecated`,
            file,
            line: i + 1,
            rule: this.id,
            suggestion: 'Use the new API instead',
          });
        }
      });
    });

    return issues;
  },
}
```

### Import Order

```typescript
{
  id: 'import-order',
  category: Category.LINT,
  severity: Severity.INFO,
  message: 'Imports should be ordered',
  check(file, content) {
    const lines = content.split('\n');
    const imports = lines.filter(l => l.startsWith('import'));
    const sorted = [...imports].sort();
    
    if (imports.join('\n') !== sorted.join('\n')) {
      return [{
        id: this.id,
        severity: this.severity,
        category: this.category,
        message: 'Imports are not sorted',
        file,
        line: 1,
        rule: this.id,
        suggestion: 'Sort imports alphabetically',
      }];
    }
    
    return [];
  },
}
```

### Naming Conventions

```typescript
{
  id: 'naming-convention',
  category: Category.LINT,
  severity: Severity.WARNING,
  message: 'Follow naming conventions',
  check(file, content) {
    const issues = [];
    const lines = content.split('\n');

    lines.forEach((line, i) => {
      // Classes should be PascalCase
      const classMatch = line.match(/class\s+([a-z][a-zA-Z0-9]*)/);
      if (classMatch) {
        issues.push({
          id: `${this.id}-class-${i}`,
          severity: this.severity,
          category: this.category,
          message: `Class "${classMatch[1]}" should be PascalCase`,
          file,
          line: i + 1,
          rule: this.id,
        });
      }

      // Constants should be UPPER_CASE
      const constMatch = line.match(/const\s+([a-z][a-zA-Z0-9]*)\s*=/);
      if (constMatch && constMatch[1] === constMatch[1].toLowerCase()) {
        issues.push({
          id: `${this.id}-const-${i}`,
          severity: this.severity,
          category: this.category,
          message: `Constant "${constMatch[1]}" should be UPPER_CASE`,
          file,
          line: i + 1,
          rule: this.id,
        });
      }
    });

    return issues;
  },
}
```

## Testing Rules

```typescript
import { describe, it, expect } from 'vitest';
import { rules } from './custom-rules';

describe('Custom Rules', () => {
  it('should detect hardcoded URLs', () => {
    const rule = rules.find(r => r.id === 'no-hardcoded-urls');
    const content = 'const url = "https://api.example.com";';
    const issues = rule.check('test.ts', content);
    
    expect(issues.length).toBeGreaterThan(0);
    expect(issues[0].message).toContain('hardcode');
  });
});
```

## Best Practices

1. **Keep rules simple** - One check per rule
2. **Use descriptive IDs** - Clear, kebab-case names
3. **Provide suggestions** - Help developers fix issues
4. **Test thoroughly** - Cover edge cases
5. **Document rules** - Explain why and when
6. **Consider performance** - Avoid expensive operations
7. **Use appropriate severity** - Error for critical, warning for style
