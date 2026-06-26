import { BaseCheck, CheckResult, CheckContext, Category, Severity, FileSystem } from '@devguard/core';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * TypeScript type checking
 */
export class TypeScriptCheck extends BaseCheck {
  name = 'typescript';
  category = Category.TYPE_SAFETY;
  description = 'Runs TypeScript compiler for type checking';

  async run(context: CheckContext): Promise<CheckResult> {
    const [issues, duration] = await this.measureTime(async () => {
      const issues = [];

      // Check if TypeScript is used
      const hasTsConfig = await FileSystem.exists(
        FileSystem.join(context.projectPath, 'tsconfig.json')
      );

      if (!hasTsConfig) {
        return issues;
      }

      try {
        // Run tsc --noEmit
        await execAsync('npx tsc --noEmit --pretty false', {
          cwd: context.projectPath,
        });
      } catch (error: unknown) {
        // Parse TypeScript errors
        const output = (error as { stdout?: string }).stdout || '';
        const lines = output.split('\n');

        for (const line of lines) {
          // Parse format: file.ts(line,col): error TSxxxx: message
          const match = line.match(/(.+)\((\d+),(\d+)\):\s+(error|warning)\s+TS\d+:\s+(.+)/);
          
          if (match) {
            issues.push(
              this.createIssue({
                severity: match[4] === 'error' ? Severity.ERROR : Severity.WARNING,
                category: this.category,
                message: match[5],
                file: match[1],
                line: parseInt(match[2]),
                column: parseInt(match[3]),
                rule: 'typescript',
              })
            );
          }
        }
      }

      return issues;
    });

    return this.createResult(issues.length === 0, issues, duration);
  }
}
