import { BaseCheck } from './base-check';
import { CheckResult, CheckContext, Category, Severity, Issue } from '../types/index';
import { FileSystem } from '../utils/file-system';

/**
 * Deep complexity analysis: cyclomatic complexity, nesting depth, long params, cognitive load
 */
export class ComplexityCheck extends BaseCheck {
  name = 'complexity';
  category = Category.COMPLEXITY;
  description = 'Detects cyclomatic complexity, deep nesting, long parameter lists and cognitive complexity issues';

  async run(context: CheckContext): Promise<CheckResult> {
    const [issues, duration] = await this.measureTime(async () => {
      const issues: Issue[] = [];

      const jsFiles = this.filterFiles(context.files, [
        '**/*.ts', '**/*.js', '**/*.tsx', '**/*.jsx',
        '**/*.vue', '**/*.svelte', '**/*.mjs', '**/*.cjs',
      ]);

      for (const file of jsFiles) {
        if (file.includes('.test.') || file.includes('.spec.') || file.includes('.d.ts')) continue;
        const fullPath = FileSystem.join(context.projectPath, file);
        const content = await FileSystem.readFile(fullPath);
        issues.push(...this.analyzeComplexity(content, file));
      }

      const phpFiles = this.filterFiles(context.files, ['**/*.php']);
      for (const file of phpFiles) {
        const fullPath = FileSystem.join(context.projectPath, file);
        const content = await FileSystem.readFile(fullPath);
        issues.push(...this.analyzePHPComplexity(content, file));
      }

      return issues;
    });

    return this.createResult(issues.length === 0, issues, duration);
  }

  private analyzeComplexity(content: string, file: string): Issue[] {
    const issues: Issue[] = [];
    const lines = content.split('\n');

    // Track function boundaries and complexity
    let inFunction = false;
    let functionStartLine = 0;
    let functionName = '';
    let braceDepth = 0;
    let functionBraceStart = 0;
    let complexity = 0;
    let maxNestingDepth = 0;
    let currentNestingDepth = 0;
    let paramCount = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // Skip comments
      if (trimmed.startsWith('//') || trimmed.startsWith('*')) continue;

      // Detect function start
      const funcMatch = line.match(
        /(?:function\s+(\w+)|(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?(?:function|\([^)]*\)\s*=>)|(?:async\s+)?(\w+)\s*\([^)]*\)\s*(?::\s*\w+\s*)?\{)/
      );

      if (funcMatch && !inFunction) {
        inFunction = true;
        functionStartLine = i + 1;
        functionName = funcMatch[1] || funcMatch[2] || funcMatch[3] || 'anonymous';
        functionBraceStart = braceDepth;
        complexity = 1; // base complexity
        maxNestingDepth = 0;
        currentNestingDepth = 0;

        // Count parameters
        const paramMatch = line.match(/\(([^)]*)\)/);
        if (paramMatch && paramMatch[1].trim()) {
          paramCount = paramMatch[1].split(',').filter(p => p.trim()).length;
          if (paramCount > 5) {
            issues.push(this.createIssue({
              severity: Severity.WARNING,
              category: this.category,
              message: `Function '${functionName}' has ${paramCount} parameters — consider using an options object`,
              file,
              line: i + 1,
              rule: 'max-params',
              suggestion: 'Group related params into an object: function foo({ a, b, c, d }) {}',
            }));
          }
        }
      }

      // Track brace depth for nesting
      const openBraces = (line.match(/\{/g) || []).length;
      const closeBraces = (line.match(/\}/g) || []).length;
      braceDepth += openBraces - closeBraces;

      if (inFunction) {
        currentNestingDepth = braceDepth - functionBraceStart;
        if (currentNestingDepth > maxNestingDepth) {
          maxNestingDepth = currentNestingDepth;
        }

        // Count cyclomatic complexity decision points
        if (trimmed.match(/\bif\s*\(/)) complexity++;
        if (trimmed.match(/\belse\s+if\s*\(/)) complexity++;
        if (trimmed.match(/\bfor\s*\(/)) complexity++;
        if (trimmed.match(/\bwhile\s*\(/)) complexity++;
        if (trimmed.match(/\bdo\s*\{/)) complexity++;
        if (trimmed.match(/\bcase\s+.+:/)) complexity++;
        if (trimmed.match(/\?\s*\w/)) complexity++; // ternary
        if (trimmed.match(/&&|\|\|/)) complexity++;
        if (trimmed.match(/\bcatch\s*\(/)) complexity++;

        // Check deep nesting (> 4 levels)
        if (currentNestingDepth > 4 && !trimmed.startsWith('}')) {
          issues.push(this.createIssue({
            severity: Severity.WARNING,
            category: this.category,
            message: `Deep nesting level ${currentNestingDepth} detected in '${functionName}' — consider early returns or extracting logic`,
            file,
            line: i + 1,
            rule: 'max-nesting-depth',
            suggestion: 'Use guard clauses (early return) or extract nested logic into separate functions',
          }));
        }

        // Function end: braceDepth returns to before function
        if (braceDepth <= functionBraceStart && i > functionStartLine) {
          const functionLines = i - functionStartLine + 1;

          // Report high cyclomatic complexity
          if (complexity > 10) {
            issues.push(this.createIssue({
              severity: Severity.ERROR,
              category: this.category,
              message: `Function '${functionName}' has cyclomatic complexity of ${complexity} (max: 10) — extremely hard to test`,
              file,
              line: functionStartLine,
              rule: 'cyclomatic-complexity',
              suggestion: 'Break this function into smaller, single-purpose functions. Aim for complexity ≤ 5',
            }));
          } else if (complexity > 7) {
            issues.push(this.createIssue({
              severity: Severity.WARNING,
              category: this.category,
              message: `Function '${functionName}' has cyclomatic complexity of ${complexity} — consider simplifying`,
              file,
              line: functionStartLine,
              rule: 'cyclomatic-complexity',
              suggestion: 'Extract conditional branches into separate functions',
            }));
          }

          // Report very long functions
          if (functionLines > 100) {
            issues.push(this.createIssue({
              severity: Severity.ERROR,
              category: this.category,
              message: `Function '${functionName}' is ${functionLines} lines long — split it up`,
              file,
              line: functionStartLine,
              rule: 'max-function-length',
              suggestion: 'Functions should ideally be under 40 lines. Extract logic into helper functions',
            }));
          } else if (functionLines > 50) {
            issues.push(this.createIssue({
              severity: Severity.WARNING,
              category: this.category,
              message: `Function '${functionName}' is ${functionLines} lines long`,
              file,
              line: functionStartLine,
              rule: 'max-function-length',
              suggestion: 'Consider splitting into smaller functions for readability',
            }));
          }

          inFunction = false;
          complexity = 1;
        }
      }

      // Detect callback hell (nested callbacks >= 3 levels)
      if (line.match(/function\s*\([^)]*\)\s*\{/) || line.match(/=>\s*\{/)) {
        const indentLevel = line.search(/\S/);
        if (indentLevel >= 12) { // 3+ levels of 4-space indent
          issues.push(this.createIssue({
            severity: Severity.WARNING,
            category: this.category,
            message: 'Callback hell detected — deeply nested callbacks reduce readability',
            file,
            line: i + 1,
            rule: 'no-callback-hell',
            suggestion: 'Use async/await or extract callbacks into named functions',
          }));
        }
      }
    }

    return issues;
  }

  private analyzePHPComplexity(content: string, file: string): Issue[] {
    const issues: Issue[] = [];
    const lines = content.split('\n');

    let inMethod = false;
    let methodName = '';
    let methodStartLine = 0;
    let complexity = 1;
    let braceDepth = 0;
    let methodBraceStart = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      if (trimmed.startsWith('//') || trimmed.startsWith('#') || trimmed.startsWith('*')) continue;

      const methodMatch = line.match(/(?:public|private|protected|static)\s+function\s+(\w+)\s*\(/);
      if (methodMatch && !inMethod) {
        inMethod = true;
        methodName = methodMatch[1];
        methodStartLine = i + 1;
        methodBraceStart = braceDepth;
        complexity = 1;

        // Count params
        const paramMatch = line.match(/\(([^)]*)\)/);
        if (paramMatch && paramMatch[1].trim()) {
          const paramCount = paramMatch[1].split(',').filter(p => p.trim()).length;
          if (paramCount > 5) {
            issues.push(this.createIssue({
              severity: Severity.WARNING,
              category: this.category,
              message: `Method '${methodName}' has ${paramCount} parameters — use a DTO or value object`,
              file,
              line: i + 1,
              rule: 'max-params',
              suggestion: 'Consider using a Data Transfer Object (DTO) or array/collection parameter',
            }));
          }
        }
      }

      const openBraces = (line.match(/\{/g) || []).length;
      const closeBraces = (line.match(/\}/g) || []).length;
      braceDepth += openBraces - closeBraces;

      if (inMethod) {
        if (trimmed.match(/\bif\s*\(/)) complexity++;
        if (trimmed.match(/\belseif\s*\(/)) complexity++;
        if (trimmed.match(/\bfor\s*\(/)) complexity++;
        if (trimmed.match(/\bforeach\s*\(/)) complexity++;
        if (trimmed.match(/\bwhile\s*\(/)) complexity++;
        if (trimmed.match(/\bcase\s+.+:/)) complexity++;
        if (trimmed.match(/\?\s*\w/)) complexity++;
        if (trimmed.match(/&&|\|\|/)) complexity++;
        if (trimmed.match(/\bcatch\s*\(/)) complexity++;

        if (braceDepth <= methodBraceStart && i > methodStartLine) {
          const methodLines = i - methodStartLine + 1;

          if (complexity > 10) {
            issues.push(this.createIssue({
              severity: Severity.ERROR,
              category: this.category,
              message: `Method '${methodName}' has cyclomatic complexity of ${complexity} (max: 10)`,
              file,
              line: methodStartLine,
              rule: 'cyclomatic-complexity',
              suggestion: 'Refactor into smaller methods. Apply Single Responsibility Principle',
            }));
          } else if (complexity > 7) {
            issues.push(this.createIssue({
              severity: Severity.WARNING,
              category: this.category,
              message: `Method '${methodName}' has cyclomatic complexity of ${complexity}`,
              file,
              line: methodStartLine,
              rule: 'cyclomatic-complexity',
              suggestion: 'Consider extracting conditional logic into separate private methods',
            }));
          }

          if (methodLines > 80) {
            issues.push(this.createIssue({
              severity: Severity.ERROR,
              category: this.category,
              message: `Method '${methodName}' is ${methodLines} lines — violates Single Responsibility`,
              file,
              line: methodStartLine,
              rule: 'max-method-length',
              suggestion: 'Split into smaller private methods. PSR recommends methods under 40 lines',
            }));
          }

          inMethod = false;
          complexity = 1;
        }
      }
    }

    return issues;
  }
}
