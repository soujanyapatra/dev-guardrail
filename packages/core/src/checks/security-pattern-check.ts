import { BaseCheck } from './base-check';
import { CheckResult, CheckContext, Category, Severity, Issue } from '../types/index';
import { FileSystem } from '../utils/file-system';

/**
 * Detects common security vulnerabilities and anti-patterns
 */
export class SecurityPatternCheck extends BaseCheck {
  name = 'security-patterns';
  category = Category.SECURITY;
  description = 'Detects SQL injection, XSS, and other security vulnerabilities';

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
        const fileIssues = this.checkJavaScriptSecurity(content, file);
        issues.push(...fileIssues);
      }

      // PHP files (including Blade templates)
      const phpFiles = this.filterFiles(context.files, ['**/*.php', '**/*.blade.php']);

      for (const file of phpFiles) {
        const fullPath = FileSystem.join(context.projectPath, file);
        const content = await FileSystem.readFile(fullPath);
        const fileIssues = this.checkPHPSecurity(content, file);
        issues.push(...fileIssues);
      }

      return issues;
    });

    return this.createResult(issues.length === 0, issues, duration);
  }

  private checkJavaScriptSecurity(content: string, file: string): Issue[] {
    const issues: Issue[] = [];
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      // Check for eval() usage
      if (line.match(/\beval\s*\(/)) {
        issues.push(
          this.createIssue({
            severity: Severity.ERROR,
            category: this.category,
            message: 'Using eval() is extremely dangerous and should be avoided',
            file,
            line: index + 1,
            rule: 'no-eval',
            suggestion: 'Refactor code to avoid eval() - it allows arbitrary code execution',
            link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/eval#never_use_eval!',
          })
        );
      }

      // Check for innerHTML with variables (XSS risk)
      if (line.match(/\.innerHTML\s*=\s*[^'"]/)) {
        issues.push(
          this.createIssue({
            severity: Severity.WARNING,
            category: this.category,
            message: 'Setting innerHTML with dynamic content - potential XSS vulnerability',
            file,
            line: index + 1,
            rule: 'no-inner-html',
            suggestion: 'Use textContent, or sanitize HTML with DOMPurify',
            link: 'https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html',
          })
        );
      }

      // Check for dangerouslySetInnerHTML in React
      if (line.match(/dangerouslySetInnerHTML/)) {
        issues.push(
          this.createIssue({
            severity: Severity.WARNING,
            category: this.category,
            message: 'Using dangerouslySetInnerHTML - ensure content is sanitized',
            file,
            line: index + 1,
            rule: 'dangerous-html',
            suggestion: 'Only use with sanitized content (e.g., DOMPurify)',
            link: 'https://react.dev/reference/react-dom/components/common#dangerously-setting-the-inner-html',
          })
        );
      }

      // Check for document.write (security and performance issue)
      if (line.match(/document\.write/)) {
        issues.push(
          this.createIssue({
            severity: Severity.WARNING,
            category: this.category,
            message: 'Using document.write() is deprecated and can cause security issues',
            file,
            line: index + 1,
            rule: 'no-document-write',
            suggestion: 'Use modern DOM manipulation methods instead',
          })
        );
      }

      // Check for SQL-like string concatenation
      if (line.match(/(SELECT|INSERT|UPDATE|DELETE).*\+.*\$|`.*\$.*`/i)) {
        issues.push(
          this.createIssue({
            severity: Severity.ERROR,
            category: this.category,
            message: 'Potential SQL injection - using string concatenation for queries',
            file,
            line: index + 1,
            rule: 'sql-injection',
            suggestion: 'Use parameterized queries or ORM methods',
            link: 'https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html',
          })
        );
      }

      // Check for localStorage with sensitive data keywords
      if (line.match(/localStorage\.setItem.*(?:token|password|secret|key)/i)) {
        issues.push(
          this.createIssue({
            severity: Severity.WARNING,
            category: this.category,
            message: 'Storing sensitive data in localStorage - security risk',
            file,
            line: index + 1,
            rule: 'no-sensitive-localstorage',
            suggestion: 'Use httpOnly cookies or secure session storage for sensitive data',
            link: 'https://owasp.org/www-community/vulnerabilities/Insecure_Storage',
          })
        );
      }

      // Check for window.location with user input
      if (line.match(/window\.location.*=.*(?:\$|\+|`)/)) {
        issues.push(
          this.createIssue({
            severity: Severity.WARNING,
            category: this.category,
            message: 'Setting window.location with dynamic content - open redirect risk',
            file,
            line: index + 1,
            rule: 'open-redirect',
            suggestion: 'Validate and whitelist redirect URLs',
            link: 'https://cheatsheetseries.owasp.org/cheatsheets/Unvalidated_Redirects_and_Forwards_Cheat_Sheet.html',
          })
        );
      }

      // Check for new Function() (similar to eval)
      if (line.match(/new\s+Function\s*\(/)) {
        issues.push(
          this.createIssue({
            severity: Severity.ERROR,
            category: this.category,
            message: 'Using new Function() is dangerous like eval()',
            file,
            line: index + 1,
            rule: 'no-new-function',
            suggestion: 'Refactor to avoid dynamic code execution',
          })
        );
      }
    });

    return issues;
  }

  private checkPHPSecurity(content: string, file: string): Issue[] {
    const issues: Issue[] = [];
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      // Check for SQL injection via string concatenation
      if (line.match(/DB::.*\(.*['"]\s*\.\s*\$|"SELECT.*\$|'SELECT.*\$/i)) {
        issues.push(
          this.createIssue({
            severity: Severity.ERROR,
            category: this.category,
            message: 'Potential SQL injection - avoid string concatenation in queries',
            file,
            line: index + 1,
            rule: 'sql-injection',
            suggestion: 'Use parameter binding: DB::select("SELECT * FROM users WHERE id = ?", [$id])',
            link: 'https://laravel.com/docs/database#running-queries',
          })
        );
      }

      // Check for raw SQL with DB::raw and variables
      if (line.match(/DB::raw\s*\(.*\$/)) {
        issues.push(
          this.createIssue({
            severity: Severity.WARNING,
            category: this.category,
            message: 'Using DB::raw() with variables - potential SQL injection',
            file,
            line: index + 1,
            rule: 'raw-sql-injection',
            suggestion: 'Validate and escape inputs, or use query builder methods',
            link: 'https://laravel.com/docs/queries#raw-expressions',
          })
        );
      }

      // Check for eval() in PHP
      if (line.match(/\beval\s*\(/)) {
        issues.push(
          this.createIssue({
            severity: Severity.ERROR,
            category: this.category,
            message: 'Using eval() is extremely dangerous',
            file,
            line: index + 1,
            rule: 'no-eval',
            suggestion: 'Refactor to avoid eval() - it allows arbitrary code execution',
          })
        );
      }

      // Check for unserialize with untrusted data
      if (line.match(/unserialize\s*\(\s*\$/)) {
        issues.push(
          this.createIssue({
            severity: Severity.ERROR,
            category: this.category,
            message: 'Using unserialize() with user input - object injection risk',
            file,
            line: index + 1,
            rule: 'unsafe-unserialize',
            suggestion: 'Use json_decode() or validate serialized data',
            link: 'https://owasp.org/www-community/vulnerabilities/PHP_Object_Injection',
          })
        );
      }

      // Check for extract() usage
      if (line.match(/\bextract\s*\(/)) {
        issues.push(
          this.createIssue({
            severity: Severity.WARNING,
            category: this.category,
            message: 'Using extract() can lead to variable overwrites',
            file,
            line: index + 1,
            rule: 'no-extract',
            suggestion: 'Access array values directly instead of using extract()',
          })
        );
      }

      // Check for echo with unescaped variables (XSS)
      if (line.match(/echo\s+\$(?!e\()|print\s+\$/)) {
        issues.push(
          this.createIssue({
            severity: Severity.WARNING,
            category: this.category,
            message: 'Echoing variable without escaping - potential XSS',
            file,
            line: index + 1,
            rule: 'xss-echo',
            suggestion: 'In Laravel use: {{ $variable }} (auto-escaped) or {!! $variable !!} if HTML is intended',
            link: 'https://laravel.com/docs/blade#displaying-data',
          })
        );
      }

      // Check for {!! !!} in blade (unescaped output)
      if (line.match(/\{!!\s*\$/)) {
        issues.push(
          this.createIssue({
            severity: Severity.INFO,
            category: this.category,
            message: 'Unescaped Blade output {!! !!} - ensure data is sanitized',
            file,
            line: index + 1,
            rule: 'blade-unescaped',
            suggestion: 'Only use {!! !!} for trusted/sanitized HTML content',
            link: 'https://laravel.com/docs/blade#displaying-unescaped-data',
          })
        );
      }

      // Check for system/exec/shell_exec with user input
      if (line.match(/(?:system|exec|shell_exec|passthru)\s*\(.*\$/)) {
        issues.push(
          this.createIssue({
            severity: Severity.ERROR,
            category: this.category,
            message: 'Command execution with user input - command injection risk',
            file,
            line: index + 1,
            rule: 'command-injection',
            suggestion: 'Avoid shell commands with user input, or use escapeshellarg()',
            link: 'https://owasp.org/www-community/attacks/Command_Injection',
          })
        );
      }

      // Check for file_get_contents with user input (SSRF)
      if (line.match(/file_get_contents\s*\(.*\$/)) {
        issues.push(
          this.createIssue({
            severity: Severity.WARNING,
            category: this.category,
            message: 'file_get_contents with user input - SSRF vulnerability',
            file,
            line: index + 1,
            rule: 'ssrf-risk',
            suggestion: 'Validate and whitelist URLs, use Laravel HTTP client with proper validation',
            link: 'https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html',
          })
        );
      }

      // Check for md5/sha1 for passwords (weak hashing)
      if (line.match(/(?:md5|sha1)\s*\(.*password/i)) {
        issues.push(
          this.createIssue({
            severity: Severity.ERROR,
            category: this.category,
            message: 'Using md5/sha1 for passwords - insecure hashing algorithm',
            file,
            line: index + 1,
            rule: 'weak-password-hash',
            suggestion: 'Use bcrypt: Hash::make($password) or password_hash()',
            link: 'https://laravel.com/docs/hashing',
          })
        );
      }
    });

    return issues;
  }
}
