import { BaseCheck } from './base-check';
import { CheckResult, CheckContext, Category, Severity, Issue } from '../types/index';
import { FileSystem } from '../utils/file-system';

/**
 * Detects TODO and FIXME comments
 */
export class TodoCheck extends BaseCheck {
  name = 'todo-detection';
  category = Category.DOCUMENTATION;
  description = 'Detects TODO, FIXME, and similar comments';

  async run(context: CheckContext): Promise<CheckResult> {
    const [issues, duration] = await this.measureTime(async () => {
      const issues: Issue[] = [];
      const files = context.files;

      const todoPatterns = [
        { pattern: /\/\/\s*TODO:/i, type: 'TODO' },
        { pattern: /\/\/\s*FIXME:/i, type: 'FIXME' },
        { pattern: /\/\/\s*HACK:/i, type: 'HACK' },
        { pattern: /\/\/\s*XXX:/i, type: 'XXX' },
        { pattern: /\/\/\s*BUG:/i, type: 'BUG' },
        { pattern: /\/\*\s*TODO:/i, type: 'TODO' },
        { pattern: /\/\*\s*FIXME:/i, type: 'FIXME' },
      ];

      for (const file of files) {
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

    return this.createResult(issues.length === 0, issues, duration);
  }
}
