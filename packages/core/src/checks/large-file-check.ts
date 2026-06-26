import { BaseCheck } from './base-check.js';
import { CheckResult, CheckContext, Category, Severity } from '../types/index.js';
import { FileSystem } from '../utils/file-system.js';

/**
 * Detects large files that should be split
 */
export class LargeFileCheck extends BaseCheck {
  name = 'large-file-detection';
  category = Category.COMPLEXITY;
  description = 'Detects files that are too large and should be split';

  private readonly MAX_LINES = 500;
  private readonly MAX_SIZE_KB = 100;

  async run(context: CheckContext): Promise<CheckResult> {
    const [issues, duration] = await this.measureTime(async () => {
      const issues = [];
      const files = context.files;

      for (const file of files) {
        const fullPath = FileSystem.join(context.projectPath, file);
        const stats = await FileSystem.getStats(fullPath);

        if (stats.isDirectory) continue;

        // Check file size
        const sizeKB = stats.size / 1024;
        if (sizeKB > this.MAX_SIZE_KB) {
          issues.push(
            this.createIssue({
              severity: Severity.WARNING,
              category: this.category,
              message: `File is too large (${Math.round(sizeKB)}KB)`,
              file,
              rule: 'max-file-size',
              suggestion: `Consider splitting this file into smaller modules (max ${this.MAX_SIZE_KB}KB)`,
            })
          );
        }

        // Check line count
        if (stats.lines > this.MAX_LINES) {
          issues.push(
            this.createIssue({
              severity: Severity.WARNING,
              category: this.category,
              message: `File has too many lines (${stats.lines})`,
              file,
              rule: 'max-lines',
              suggestion: `Consider splitting this file into smaller modules (max ${this.MAX_LINES} lines)`,
            })
          );
        }
      }

      return issues;
    });

    return this.createResult(issues.length === 0, issues, duration, {
      maxLines: this.MAX_LINES,
      maxSizeKB: this.MAX_SIZE_KB,
    });
  }
}
