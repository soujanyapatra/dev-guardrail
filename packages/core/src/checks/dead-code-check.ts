import { BaseCheck } from './base-check';
import { CheckResult, CheckContext, Category, Severity, Issue } from '../types/index';
import { FileSystem } from '../utils/file-system';

/**
 * Detects dead code: unreachable code, commented-out code blocks, always-true/false conditions, debugger
 */
export class DeadCodeCheck extends BaseCheck {
  name = 'dead-code';
  category = Category.LINT;
  description = 'Detects unreachable code, commented-out code blocks, debugger statements';

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
        issues.push(...this.detectDeadCode(content, file));
      }

      const phpFiles = this.filterFiles(context.files, ['**/*.php']);
      for (const file of phpFiles) {
        const fullPath = FileSystem.join(context.projectPath, file);
        const content = await FileSystem.readFile(fullPath);
        issues.push(...this.detectPHPDeadCode(content, file));
      }

      return issues;
    });

    return this.createResult(issues.length === 0, issues, duration);
  }

  private detectDeadCode(content: string, file: string): Issue[] {
    const issues: Issue[] = [];
    const lines = content.split('\n');

    let afterReturn = false;
    let braceDepth = 0;
    let returnBraceDepth = -1;
    let consecutiveCommentedCodeLines = 0;
    let commentedCodeStart = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      const openBraces = (line.match(/\{/g) || []).length;
      const closeBraces = (line.match(/\}/g) || []).length;
      braceDepth += openBraces - closeBraces;

      // Reset unreachable tracking when scope exits
      if (afterReturn && braceDepth < returnBraceDepth) {
        afterReturn = false;
        returnBraceDepth = -1;
      }

      if (!trimmed.startsWith('//') && !trimmed.startsWith('*')) {
        if (
          afterReturn &&
          trimmed &&
          !trimmed.startsWith('}') &&
          !trimmed.startsWith('case ') &&
          !trimmed.startsWith('default:')
        ) {
          issues.push(this.createIssue({
            severity: Severity.WARNING,
            category: this.category,
            message: 'Unreachable code — code after return/throw/break will never execute',
            file,
            line: i + 1,
            rule: 'no-unreachable',
            suggestion: 'Remove or relocate this code — it is never executed',
          }));
          afterReturn = false;
        }

        if (trimmed.match(/^(return|throw|break|continue)\b/) && !trimmed.endsWith(',')) {
          afterReturn = true;
          returnBraceDepth = braceDepth;
        }
      }

      // Detect large blocks of commented-out code
      if (trimmed.startsWith('//')) {
        if (trimmed.match(/\/\/\s*(?:const|let|var|function|if|for|return|import|export|\w+\s*\(|\w+\s*=)/)) {
          consecutiveCommentedCodeLines++;
          if (consecutiveCommentedCodeLines === 1) commentedCodeStart = i + 1;
          if (consecutiveCommentedCodeLines === 3) {
            issues.push(this.createIssue({
              severity: Severity.INFO,
              category: this.category,
              message: 'Large block of commented-out code detected',
              file,
              line: commentedCodeStart,
              rule: 'no-commented-code',
              suggestion: 'Delete commented-out code — use git history to recover it if needed',
            }));
          }
        } else {
          consecutiveCommentedCodeLines = 0;
        }
      } else {
        consecutiveCommentedCodeLines = 0;
      }

      // Detect always-true/false conditions
      if (trimmed.match(/if\s*\(\s*(?:true|false|1\s*===\s*1|0\s*===\s*0)\s*\)/)) {
        issues.push(this.createIssue({
          severity: Severity.WARNING,
          category: this.category,
          message: 'Always-true/false condition — one branch is dead code',
          file,
          line: i + 1,
          rule: 'no-constant-condition',
          suggestion: 'Remove the condition and keep only the relevant branch',
        }));
      }

      // Detect debugger statement
      if (trimmed === 'debugger;' || trimmed === 'debugger') {
        issues.push(this.createIssue({
          severity: Severity.ERROR,
          category: this.category,
          message: 'debugger statement found — must be removed before production',
          file,
          line: i + 1,
          rule: 'no-debugger',
          suggestion: 'Remove the debugger statement',
        }));
      }
    }

    return issues;
  }

  private detectPHPDeadCode(content: string, file: string): Issue[] {
    const issues: Issue[] = [];
    const lines = content.split('\n');

    let afterReturn = false;
    let braceDepth = 0;
    let returnBraceDepth = -1;
    let consecutiveCommentedCodeLines = 0;
    let commentedCodeStart = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      const openBraces = (line.match(/\{/g) || []).length;
      const closeBraces = (line.match(/\}/g) || []).length;
      braceDepth += openBraces - closeBraces;

      if (afterReturn && braceDepth < returnBraceDepth) {
        afterReturn = false;
        returnBraceDepth = -1;
      }

      if (!trimmed.startsWith('//') && !trimmed.startsWith('#') && !trimmed.startsWith('*')) {
        if (afterReturn && trimmed && !trimmed.startsWith('}') && !trimmed.startsWith('case ') && !trimmed.startsWith('default:')) {
          issues.push(this.createIssue({
            severity: Severity.WARNING,
            category: this.category,
            message: 'Unreachable PHP code after return/throw',
            file,
            line: i + 1,
            rule: 'no-unreachable',
            suggestion: 'Remove code that can never be executed',
          }));
          afterReturn = false;
        }

        if (trimmed.match(/^(return|throw)\b/)) {
          afterReturn = true;
          returnBraceDepth = braceDepth;
        }
      }

      // Commented-out PHP code
      if (trimmed.startsWith('//')) {
        if (trimmed.match(/\/\/\s*(?:\$\w+|function|if|foreach|return|class|\w+\()/)) {
          consecutiveCommentedCodeLines++;
          if (consecutiveCommentedCodeLines === 1) commentedCodeStart = i + 1;
          if (consecutiveCommentedCodeLines === 3) {
            issues.push(this.createIssue({
              severity: Severity.INFO,
              category: this.category,
              message: 'Large block of commented-out PHP code',
              file,
              line: commentedCodeStart,
              rule: 'no-commented-code',
              suggestion: 'Delete commented-out code and use git history instead',
            }));
          }
        } else {
          consecutiveCommentedCodeLines = 0;
        }
      } else {
        consecutiveCommentedCodeLines = 0;
      }
    }

    return issues;
  }
}
