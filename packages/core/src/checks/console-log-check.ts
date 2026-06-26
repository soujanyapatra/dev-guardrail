import { BaseCheck } from './base-check.js';
import { CheckResult, CheckContext, Category, Severity } from '../types/index.js';
import { FileSystem } from '../utils/file-system.js';

/**
 * Detects console.log statements in production code
 */
export class ConsoleLogCheck extends BaseCheck {
  name = 'console-log-detection';
  category = Category.LINT;
  description = 'Detects console.log and debugging statements';

  async run(context: CheckContext): Promise<CheckResult> {
    const [issues, duration] = await this.measureTime(async () => {
      const issues = [];
      const files = this.filterFiles(context.files, ['**/*.ts', '**/*.js', '**/*.tsx', '**/*.jsx']);

      for (const file of files) {
        // Skip test files
        if (file.includes('.test.') || file.includes('.spec.')) {
          continue;
        }

        const fullPath = FileSystem.join(context.projectPath, file);
        const content = await FileSystem.readFile(fullPath);
        const lines = content.split('\n');

        lines.forEach((line, index) => {
          // Check for console statements
          const consoleMatch = line.match(/console\.(log|debug|info|warn|error|trace)/);
          if (consoleMatch) {
            issues.push(
              this.createIssue({
                severity: Severity.WARNING,
                category: this.category,
                message: `Found ${consoleMatch[0]} statement`,
                file,
                line: index + 1,
                rule: 'no-console',
                suggestion: 'Remove console statements or use a proper logging library',
              })
            );
          }

          // Check for debugger statements
          if (line.includes('debugger')) {
            issues.push(
              this.createIssue({
                severity: Severity.ERROR,
                category: this.category,
                message: 'Found debugger statement',
                file,
                line: index + 1,
                rule: 'no-debugger',
                suggestion: 'Remove debugger statements before committing',
              })
            );
          }
        });
      }

      return issues;
    });

    return this.createResult(issues.length === 0, issues, duration);
  }
}
