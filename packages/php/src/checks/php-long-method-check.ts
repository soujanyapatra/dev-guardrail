import { BaseCheck } from './base-check';
import { CheckResult, CheckContext, Category, Severity, Issue } from '../types/index';
import { FileSystem } from '../utils/file-system';

/**
 * Detects long methods in PHP that should be refactored
 */
export class PHPLongMethodCheck extends BaseCheck {
  name = 'php-long-method';
  category = Category.COMPLEXITY;
  description = 'Detects PHP methods that are too long';

  private readonly MAX_METHOD_LINES = 50;

  async run(context: CheckContext): Promise<CheckResult> {
    const [issues, duration] = await this.measureTime(async () => {
      const issues: Issue[] = [];
      const phpFiles = this.filterFiles(context.files, ['**/*.php', '**/*.blade.php']);

      for (const file of phpFiles) {
        const fullPath = FileSystem.join(context.projectPath, file);
        const content = await FileSystem.readFile(fullPath);
        const methods = this.extractMethods(content);

        for (const method of methods) {
          if (method.lineCount > this.MAX_METHOD_LINES) {
            issues.push(
              this.createIssue({
                severity: Severity.WARNING,
                category: this.category,
                message: `Method '${method.name}' is too long (${method.lineCount} lines)`,
                file,
                line: method.startLine,
                rule: 'max-method-length',
                suggestion: `Consider splitting this method into smaller methods (max ${this.MAX_METHOD_LINES} lines)`,
              })
            );
          }
        }
      }

      return issues;
    });

    return this.createResult(issues.length === 0, issues, duration);
  }

  /**
   * Extract methods from PHP content
   */
  private extractMethods(content: string): Array<{ name: string; startLine: number; lineCount: number }> {
    const methods: Array<{ name: string; startLine: number; lineCount: number }> = [];
    const lines = content.split('\n');
    
    let inMethod = false;
    let methodName = '';
    let methodStart = 0;
    let braceCount = 0;

    lines.forEach((line, index) => {
      // Detect method declaration
      const methodMatch = line.match(/function\s+(\w+)\s*\(/);
      if (methodMatch && !inMethod) {
        inMethod = true;
        methodName = methodMatch[1];
        methodStart = index + 1;
        braceCount = 0;
      }

      if (inMethod) {
        // Count braces
        braceCount += (line.match(/{/g) || []).length;
        braceCount -= (line.match(/}/g) || []).length;

        // Method ends when braces balance
        if (braceCount === 0 && line.includes('}')) {
          methods.push({
            name: methodName,
            startLine: methodStart,
            lineCount: (index + 1) - methodStart,
          });
          inMethod = false;
        }
      }
    });

    return methods;
  }
}
