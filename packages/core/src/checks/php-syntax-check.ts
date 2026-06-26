import { BaseCheck } from './base-check';
import { CheckResult, CheckContext, Category, Severity, Issue } from '../types/index';
import { FileSystem } from '../utils/file-system';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * PHP syntax validation check
 */
export class PHPSyntaxCheck extends BaseCheck {
  name = 'php-syntax';
  category = Category.LINT;
  description = 'Validates PHP syntax';

  async run(context: CheckContext): Promise<CheckResult> {
    const [issues, duration] = await this.measureTime(async () => {
      const issues: Issue[] = [];
      const phpFiles = this.filterFiles(context.files, ['**/*.php']);

      if (phpFiles.length === 0) {
        return issues;
      }

      for (const file of phpFiles) {
        const fullPath = FileSystem.join(context.projectPath, file);
        
        try {
          // Run php -l (lint) to check syntax
          await execAsync(`php -l "${fullPath}"`);
        } catch (error: any) {
          // Parse PHP syntax error
          const output = error.stderr || error.stdout || '';
          const lineMatch = output.match(/line (\d+)/);
          const line = lineMatch ? parseInt(lineMatch[1]) : 1;

          issues.push(
            this.createIssue({
              severity: Severity.ERROR,
              category: this.category,
              message: 'PHP syntax error',
              file,
              line,
              rule: 'php-syntax',
              suggestion: 'Fix the syntax error in this file',
            })
          );
        }
      }

      return issues;
    });

    return this.createResult(issues.length === 0, issues, duration, {
      filesChecked: this.filterFiles(context.files, ['**/*.php']).length,
    });
  }
}
