import { BaseCheck, CheckResult, CheckContext, Category, Severity } from '@devguard/core';
import { ESLint } from 'eslint';

/**
 * ESLint integration check
 */
export class ESLintCheck extends BaseCheck {
  name = 'eslint';
  category = Category.LINT;
  description = 'Runs ESLint on JavaScript and TypeScript files';

  async run(context: CheckContext): Promise<CheckResult> {
    const [issues, duration] = await this.measureTime(async () => {
      const issues = [];
      
      // Filter JS/TS files
      const files = this.filterFiles(context.files, [
        '**/*.js',
        '**/*.jsx',
        '**/*.ts',
        '**/*.tsx',
      ]);

      if (files.length === 0) {
        return issues;
      }

      try {
        // Create ESLint instance
        const eslint = new ESLint({
          cwd: context.projectPath,
          useEslintrc: true,
        });

        // Lint files
        const results = await eslint.lintFiles(files);

        // Convert ESLint results to DevGuard issues
        for (const result of results) {
          for (const message of result.messages) {
            issues.push(
              this.createIssue({
                severity: message.severity === 2 ? Severity.ERROR : Severity.WARNING,
                category: this.category,
                message: message.message,
                file: result.filePath,
                line: message.line,
                column: message.column,
                rule: message.ruleId || 'eslint',
                suggestion: message.fix ? 'Auto-fixable with --fix' : undefined,
              })
            );
          }
        }
      } catch (error) {
        // ESLint not configured, skip
        return [];
      }

      return issues;
    });

    return this.createResult(issues.length === 0, issues, duration);
  }
}
