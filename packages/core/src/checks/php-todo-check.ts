import { BaseCheck } from './base-check';
import { CheckResult, CheckContext, Category, Severity, Issue } from '../types/index';
import { FileSystem } from '../utils/file-system';

/**
 * Detects TODO/FIXME comments in PHP code
 */
export class PHPTodoCheck extends BaseCheck {
  name = 'php-todo-detection';
  category = Category.DOCUMENTATION;
  description = 'Finds TODO, FIXME comments in PHP files';

  async run(context: CheckContext): Promise<CheckResult> {
    const [issues, duration] = await this.measureTime(async () => {
      const issues: Issue[] = [];
      const phpFiles = this.filterFiles(context.files, ['**/*.php']);

      const todoPatterns = [
        { pattern: /\/\/\s*TODO:/i, type: 'TODO' },
        { pattern: /\/\/\s*FIXME:/i, type: 'FIXME' },
        { pattern: /\/\/\s*HACK:/i, type: 'HACK' },
        { pattern: /\/\/\s*XXX:/i, type: 'XXX' },
        { pattern: /\/\*\s*TODO:/i, type: 'TODO' },
        { pattern: /\/\*\s*FIXME:/i, type: 'FIXME' },
      ];

      for (const file of phpFiles) {
        const fullPath = FileSystem.join(context.projectPath, file);
        const content = await FileSystem.readFile(fullPath);
        const lines = content.split('\n');

        lines.forEach((line, index) => {
          for (const { pattern, type } of todoPatterns) {
            if (pattern.test(line)) {
              issues.push(
                this.createIssue({
                  severity: Severity.INFO,
                  category: this.category,
                  message: `Found ${type} comment: ${line.trim()}`,
                  file,
                  line: index + 1,
                  rule: 'no-todo-comments',
                  suggestion: 'Consider creating a ticket and removing the comment',
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
