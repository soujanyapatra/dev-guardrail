import { BaseCheck } from './base-check';
import { CheckResult, CheckContext, Category, Severity, Issue } from '../types/index';
import { FileSystem } from '../utils/file-system';

/**
 * Checks naming conventions across different languages
 */
export class NamingConventionCheck extends BaseCheck {
  name = 'naming-convention';
  category = Category.LINT;
  description = 'Validates naming conventions for variables, functions, and classes';

  async run(context: CheckContext): Promise<CheckResult> {
    const [issues, duration] = await this.measureTime(async () => {
      const issues: Issue[] = [];
      
      // JavaScript/TypeScript files
      const jsFiles = this.filterFiles(context.files, [
        '**/*.ts',
        '**/*.js',
        '**/*.tsx',
        '**/*.jsx',
        '**/*.vue',
        '**/*.svelte',
        '**/*.mjs',
        '**/*.cjs',
      ]);

      for (const file of jsFiles) {
        const fullPath = FileSystem.join(context.projectPath, file);
        const content = await FileSystem.readFile(fullPath);
        const fileIssues = this.checkJavaScriptNaming(content, file);
        issues.push(...fileIssues);
      }

      // PHP files (including Blade templates)
      const phpFiles = this.filterFiles(context.files, ['**/*.php', '**/*.blade.php']);

      for (const file of phpFiles) {
        const fullPath = FileSystem.join(context.projectPath, file);
        const content = await FileSystem.readFile(fullPath);
        const fileIssues = this.checkPHPNaming(content, file);
        issues.push(...fileIssues);
      }

      return issues;
    });

    return this.createResult(issues.length === 0, issues, duration);
  }

  private checkJavaScriptNaming(content: string, file: string): Issue[] {
    const issues: Issue[] = [];
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      // Skip comments and imports
      if (line.trim().startsWith('//') || 
          line.trim().startsWith('*') ||
          line.trim().startsWith('import') ||
          line.trim().startsWith('export')) {
        return;
      }

      // Check class names (should be PascalCase)
      const classMatch = line.match(/class\s+([a-z][a-zA-Z0-9]*)/);
      if (classMatch) {
        issues.push(
          this.createIssue({
            severity: Severity.WARNING,
            category: this.category,
            message: `Class name '${classMatch[1]}' should use PascalCase`,
            file,
            line: index + 1,
            rule: 'class-name-pascal-case',
            suggestion: `Rename to '${this.toPascalCase(classMatch[1])}'`,
          })
        );
      }

      // Check function names (should be camelCase, not snake_case)
      const funcMatch = line.match(/function\s+([A-Z_][a-zA-Z0-9_]*)\s*\(/);
      if (funcMatch && funcMatch[1].includes('_')) {
        issues.push(
          this.createIssue({
            severity: Severity.WARNING,
            category: this.category,
            message: `Function name '${funcMatch[1]}' should use camelCase, not snake_case`,
            file,
            line: index + 1,
            rule: 'function-name-camel-case',
            suggestion: `Rename to '${this.toCamelCase(funcMatch[1])}'`,
          })
        );
      }

      // Check const names (ALL_CAPS should be used for true constants only)
      const constMatch = line.match(/const\s+([A-Z][A-Z0-9_]{4,})\s*=/);
      if (constMatch && !line.includes('process.env')) {
        const name = constMatch[1];
        // Allow if it's actually a constant (primitive value)
        if (!line.match(/=\s*['"`\d]/) && !line.match(/=\s*true|false|null/)) {
          issues.push(
            this.createIssue({
              severity: Severity.INFO,
              category: this.category,
              message: `Use ALL_CAPS only for primitive constants, not '${name}'`,
              file,
              line: index + 1,
              rule: 'const-naming',
              suggestion: `Consider using camelCase: '${this.toCamelCase(name)}'`,
            })
          );
        }
      }

      // Check for Hungarian notation (should be avoided)
      const hungarianMatch = line.match(/\b(str|int|bool|arr|obj)([A-Z][a-zA-Z0-9]*)\b/);
      if (hungarianMatch) {
        issues.push(
          this.createIssue({
            severity: Severity.INFO,
            category: this.category,
            message: `Avoid Hungarian notation: '${hungarianMatch[0]}'`,
            file,
            line: index + 1,
            rule: 'no-hungarian-notation',
            suggestion: `Use TypeScript types instead: '${hungarianMatch[2].toLowerCase()}'`,
          })
        );
      }
    });

    return issues;
  }

  private checkPHPNaming(content: string, file: string): Issue[] {
    const issues: Issue[] = [];
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      // Skip comments
      if (line.trim().startsWith('//') || line.trim().startsWith('#')) {
        return;
      }

      // Check class names (should be PascalCase)
      const classMatch = line.match(/class\s+([a-z][a-zA-Z0-9]*)/);
      if (classMatch) {
        issues.push(
          this.createIssue({
            severity: Severity.WARNING,
            category: this.category,
            message: `Class name '${classMatch[1]}' should use PascalCase (PSR-1)`,
            file,
            line: index + 1,
            rule: 'php-class-name',
            suggestion: `Rename to '${this.toPascalCase(classMatch[1])}'`,
            link: 'https://www.php-fig.org/psr/psr-1/',
          })
        );
      }

      // Check method names (should be camelCase in Laravel/modern PHP)
      const methodMatch = line.match(/(?:public|private|protected)\s+function\s+([A-Z_][a-zA-Z0-9_]*)\s*\(/);
      if (methodMatch && methodMatch[1] !== '__construct' && !methodMatch[1].startsWith('__')) {
        issues.push(
          this.createIssue({
            severity: Severity.WARNING,
            category: this.category,
            message: `Method name '${methodMatch[1]}' should use camelCase (PSR-1)`,
            file,
            line: index + 1,
            rule: 'php-method-name',
            suggestion: `Rename to '${this.toCamelCase(methodMatch[1])}'`,
            link: 'https://www.php-fig.org/psr/psr-1/',
          })
        );
      }

      // Check for non-PSR compliant variable names (should use camelCase)
      const varMatch = line.match(/\$([A-Z_][A-Za-z0-9_]{3,})\s*[=;]/);
      if (varMatch && varMatch[1].includes('_')) {
        issues.push(
          this.createIssue({
            severity: Severity.INFO,
            category: this.category,
            message: `Consider camelCase for variable '$${varMatch[1]}'`,
            file,
            line: index + 1,
            rule: 'php-variable-name',
            suggestion: `Modern PHP prefers camelCase: '$${this.toCamelCase(varMatch[1])}'`,
          })
        );
      }
    });

    return issues;
  }

  private toPascalCase(str: string): string {
    return str
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('');
  }

  private toCamelCase(str: string): string {
    const pascal = this.toPascalCase(str);
    return pascal.charAt(0).toLowerCase() + pascal.slice(1);
  }
}
