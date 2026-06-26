import { BaseCheck } from './base-check';
import { CheckResult, CheckContext, Category, Severity, Issue } from '../types/index';
import { FileSystem } from '../utils/file-system';

/**
 * Checks for proper error handling patterns
 */
export class ErrorHandlingCheck extends BaseCheck {
  name = 'error-handling';
  category = Category.LINT;
  description = 'Validates proper error handling and exception management';

  async run(context: CheckContext): Promise<CheckResult> {
    const [issues, duration] = await this.measureTime(async () => {
      const issues: Issue[] = [];

      // JavaScript/TypeScript files
      const jsFiles = this.filterFiles(context.files, [
        '**/*.ts',
        '**/*.js',
        '**/*.tsx',
        '**/*.jsx',
        '**/*.vue',
        '**/*.svelte',
        '**/*.mjs',
        '**/*.cjs',
      ]);

      for (const file of jsFiles) {
        if (file.includes('.test.') || file.includes('.spec.')) {
          continue;
        }

        const fullPath = FileSystem.join(context.projectPath, file);
        const content = await FileSystem.readFile(fullPath);
        const fileIssues = this.checkJavaScriptErrorHandling(content, file);
        issues.push(...fileIssues);
      }

      // PHP files (including Blade templates)
      const phpFiles = this.filterFiles(context.files, ['**/*.php', '**/*.blade.php']);

      for (const file of phpFiles) {
        const fullPath = FileSystem.join(context.projectPath, file);
        const content = await FileSystem.readFile(fullPath);
        const fileIssues = this.checkPHPErrorHandling(content, file);
        issues.push(...fileIssues);
      }

      return issues;
    });

    return this.createResult(issues.length === 0, issues, duration);
  }

  private checkJavaScriptErrorHandling(content: string, file: string): Issue[] {
    const issues: Issue[] = [];
    const lines = content.split('\n');

    let inTryCatch = false;

    lines.forEach((line, index) => {
      const trimmed = line.trim();

      // Track try-catch blocks
      if (trimmed.startsWith('try')) {
        inTryCatch = true;
      }

      // Check for empty catch blocks
      if (trimmed.startsWith('catch') && inTryCatch) {
        // Look ahead for empty catch
        const nextLines = lines.slice(index, index + 5).join('\n');
        if (nextLines.match(/catch\s*\([^)]*\)\s*{\s*}/)) {
          issues.push(
            this.createIssue({
              severity: Severity.WARNING,
              category: this.category,
              message: 'Empty catch block - errors are silently swallowed',
              file,
              line: index + 1,
              rule: 'no-empty-catch',
              suggestion: 'Log the error or handle it appropriately',
            })
          );
        }

        inTryCatch = false;
      }

      // Check for Promise without catch
      if (line.match(/\.\s*then\s*\(/) && !line.includes('.catch')) {
        // Look ahead to see if catch is chained
        const nextFewLines = lines.slice(index, index + 3).join('\n');
        if (!nextFewLines.includes('.catch')) {
          issues.push(
            this.createIssue({
              severity: Severity.WARNING,
              category: this.category,
              message: 'Promise without .catch() - unhandled rejection possible',
              file,
              line: index + 1,
              rule: 'promise-catch',
              suggestion: 'Add .catch() to handle promise rejections',
            })
          );
        }
      }

      // Check for unhandled async functions without try-catch
      if (line.match(/async\s+(function|.*=>)/) && !line.includes('test')) {
        // Check next 20 lines for try-catch
        const functionBody = lines.slice(index, index + 20).join('\n');
        const hasAwait = functionBody.match(/await\s+/);
        const hasTry = functionBody.includes('try');
        
        if (hasAwait && !hasTry && !functionBody.includes('.catch')) {
          issues.push(
            this.createIssue({
              severity: Severity.INFO,
              category: this.category,
              message: 'Async function with await but no try-catch or .catch()',
              file,
              line: index + 1,
              rule: 'async-error-handling',
              suggestion: 'Wrap await calls in try-catch or use .catch()',
            })
          );
        }
      }

      // Check for throw without proper Error object
      const throwMatch = line.match(/throw\s+(['"`])/);
      if (throwMatch) {
        issues.push(
          this.createIssue({
            severity: Severity.WARNING,
            category: this.category,
            message: 'Throwing string instead of Error object',
            file,
            line: index + 1,
            rule: 'throw-error-object',
            suggestion: 'Use: throw new Error("message") instead of throw "message"',
          })
        );
      }
    });

    return issues;
  }

  private checkPHPErrorHandling(content: string, file: string): Issue[] {
    const issues: Issue[] = [];
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      // Check for empty catch blocks
      if (line.match(/catch\s*\([^)]*\)\s*{\s*}/)) {
        issues.push(
          this.createIssue({
            severity: Severity.WARNING,
            category: this.category,
            message: 'Empty catch block - exceptions are silently swallowed',
            file,
            line: index + 1,
            rule: 'no-empty-catch',
            suggestion: 'Log the exception or handle it appropriately',
            link: 'https://laravel.com/docs/errors',
          })
        );
      }

      // Check for generic Exception catch
      if (line.match(/catch\s*\(\s*Exception\s+/)) {
        issues.push(
          this.createIssue({
            severity: Severity.INFO,
            category: this.category,
            message: 'Catching generic Exception - consider specific exception types',
            file,
            line: index + 1,
            rule: 'specific-exceptions',
            suggestion: 'Catch specific exceptions (ModelNotFoundException, ValidationException, etc.)',
            link: 'https://www.php.net/manual/en/spl.exceptions.php',
          })
        );
      }

      // Check for suppressed errors with @
      if (line.match(/@[a-zA-Z_]/)) {
        issues.push(
          this.createIssue({
            severity: Severity.WARNING,
            category: this.category,
            message: 'Error suppression operator @ detected - avoid suppressing errors',
            file,
            line: index + 1,
            rule: 'no-error-suppression',
            suggestion: 'Handle errors properly instead of suppressing them',
          })
        );
      }

      // Check for die() or exit() (should use exceptions in modern PHP)
      if (line.match(/\b(die|exit)\s*\(/)) {
        issues.push(
          this.createIssue({
            severity: Severity.INFO,
            category: this.category,
            message: 'Using die()/exit() - consider throwing exceptions instead',
            file,
            line: index + 1,
            rule: 'no-die-exit',
            suggestion: 'In Laravel, throw appropriate exceptions or use abort()',
            link: 'https://laravel.com/docs/errors#http-exceptions',
          })
        );
      }
    });

    return issues;
  }
}
