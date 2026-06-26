import { BaseCheck } from './base-check';
import { CheckResult, CheckContext, Category, Severity, Issue } from '../types/index';
import { FileSystem } from '../utils/file-system';

/**
 * Detects debug statements in PHP code
 */
export class PHPDebugCheck extends BaseCheck {
  name = 'php-debug-detection';
  category = Category.LINT;
  description = 'Detects debug statements in PHP code (dd, dump, var_dump, print_r)';

  private readonly DEBUG_PATTERNS = [
    { pattern: /\bdd\s*\(/, name: 'dd()' },
    { pattern: /\bdump\s*\(/, name: 'dump()' },
    { pattern: /\bvar_dump\s*\(/, name: 'var_dump()' },
    { pattern: /\bprint_r\s*\(/, name: 'print_r()' },
    { pattern: /\bvar_export\s*\(/, name: 'var_export()' },
    { pattern: /\berror_log\s*\(/, name: 'error_log()' },
  ];

  async run(context: CheckContext): Promise<CheckResult> {
    const [issues, duration] = await this.measureTime(async () => {
      const issues: Issue[] = [];
      const phpFiles = this.filterFiles(context.files, ['**/*.php']);

      for (const file of phpFiles) {
        const fullPath = FileSystem.join(context.projectPath, file);
        const content = await FileSystem.readFile(fullPath);
        const lines = content.split('\n');

        lines.forEach((line, index) => {
          // Skip comments
          if (line.trim().startsWith('//') || line.trim().startsWith('#')) {
            return;
          }

          for (const { pattern, name } of this.DEBUG_PATTERNS) {
            if (pattern.test(line)) {
              issues.push(
                this.createIssue({
                  severity: Severity.WARNING,
                  category: this.category,
                  message: `Found debug statement: ${name}`,
                  file,
                  line: index + 1,
                  column: line.search(pattern) + 1,
                  rule: 'no-debug-statements',
                  suggestion: `Remove ${name} before committing to production`,
                  link: 'https://laravel.com/docs/logging',
                })
              );
            }
          }
        });
      }

      return issues;
    });

    return this.createResult(issues.length === 0, issues, duration, {
      filesChecked: this.filterFiles(context.files, ['**/*.php']).length,
    });
  }
}
