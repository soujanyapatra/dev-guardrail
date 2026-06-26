import { BaseCheck } from './base-check';
import { CheckResult, CheckContext, Category, Severity, Issue } from '../types/index';
import { FileSystem } from '../utils/file-system';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { join } from 'path';

const execFileAsync = promisify(execFile);

/**
 * Lint check for .ts, .tsx, .js, .jsx, .vue, .svelte files.
 *
 * Strategy:
 *  1. If ESLint is installed in the project → run it and parse JSON output
 *  2. If ESLint is NOT installed → run our built-in simple rules
 *
 * Every issue includes a "fix command" in the suggestion field.
 */
export class LintCheck extends BaseCheck {
  name = 'lint';
  category = Category.LINT;
  description = 'Lints .ts/.tsx/.js/.jsx/.vue/.svelte files using ESLint (if available) or built-in rules';

  private readonly LINT_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.vue', '.svelte', '.mjs', '.cjs'];

  // ─── Built-in simple rules ────────────────────────────────────────────────

  /** Each rule: { id, description, severity, pattern, message, suggestion, fixCmd } */
  private readonly BUILTIN_RULES: Array<{
    id: string;
    severity: Severity;
    pattern: RegExp;
    message: string;
    suggestion: string;
  }> = [
    {
      id: 'no-var',
      severity: Severity.WARNING,
      pattern: /\bvar\s+\w+/,
      message: "Use 'const' or 'let' instead of 'var'",
      suggestion: "Replace 'var' with 'const' (if value never reassigned) or 'let'",
    },
    {
      id: 'eqeqeq',
      severity: Severity.WARNING,
      pattern: /(?<![=!<>])={2}(?!=)|(?<![=!<>])!={1}(?!=)/,
      message: "Use '===' and '!==' instead of '==' and '!='",
      suggestion: "Replace '==' with '===' and '!=' with '!==' for strict equality",
    },
    {
      id: 'no-trailing-spaces',
      severity: Severity.INFO,
      pattern: /[ \t]+$/,
      message: 'Trailing whitespace found',
      suggestion: 'Remove trailing whitespace. Run: npx prettier --write <file>',
    },
    {
      id: 'no-multiple-empty-lines',
      severity: Severity.INFO,
      // Detect three or more consecutive blank lines (handled separately)
      pattern: /^$/,
      message: 'Multiple consecutive blank lines',
      suggestion: 'Reduce to at most one consecutive blank line',
    },
    {
      id: 'prefer-const',
      severity: Severity.INFO,
      // let declared but written only once (simple heuristic: let x = ...; with no reassignment pattern nearby)
      pattern: /\blet\s+(\w+)\s*=(?!=)/,
      message: "Consider 'const' instead of 'let' when variable is not reassigned",
      suggestion: "Use 'const' for variables that are never reassigned",
    },
    {
      id: 'no-alert',
      severity: Severity.WARNING,
      pattern: /\balert\s*\(/,
      message: "Avoid using alert() — blocks the UI thread",
      suggestion: "Replace alert() with a proper notification component or console.warn()",
    },
    {
      id: 'no-implicit-coercion',
      severity: Severity.INFO,
      pattern: /!!(?!\s*[a-zA-Z0-9_])|~~/,
      message: 'Avoid implicit type coercion (!! or ~~)',
      suggestion: "Use Boolean(value) or Math.floor(value) for explicit conversion",
    },
    {
      id: 'no-empty-function',
      severity: Severity.WARNING,
      pattern: /(?:function\s+\w*\s*\([^)]*\)|=>\s*)\s*\{\s*\}/,
      message: 'Empty function body detected',
      suggestion: 'Add a comment explaining why the function is empty, or implement it',
    },
    {
      id: 'no-unused-vars-hint',
      severity: Severity.INFO,
      // Simple: variables declared but the name starts with _ — warn if they DO get used
      pattern: /\b(?:const|let|var)\s+_(\w+)\s*=/,
      message: "Variable prefixed with '_' suggests it may be intentionally unused",
      suggestion: "If unused, that's fine. If it IS used, rename it to remove the _ prefix",
    },
    {
      id: 'no-console-warn',
      severity: Severity.INFO,
      pattern: /console\.(warn|error)\s*\(/,
      message: 'console.warn/error found — use a proper logger in production',
      suggestion: 'Replace with a structured logging library (winston, pino, etc.)',
    },
    {
      id: 'max-line-length',
      severity: Severity.INFO,
      // lines over 120 chars
      pattern: /.{121,}/,
      message: 'Line exceeds 120 characters',
      suggestion: 'Break long lines for readability. Run: npx prettier --write <file>',
    },
    {
      id: 'no-magic-numbers',
      severity: Severity.INFO,
      // numeric literals that aren't 0 or 1 used inline
      pattern: /[^a-zA-Z0-9_](?:[2-9]\d{2,}|\d{4,})[^a-zA-Z0-9_.]/,
      message: 'Magic number detected — extract into a named constant',
      suggestion: "const MAX_RETRIES = 5; // instead of using 5 directly",
    },
  ];

  // ─── Run ──────────────────────────────────────────────────────────────────

  async run(context: CheckContext): Promise<CheckResult> {
    const [issues, duration] = await this.measureTime(async () => {
      // Check if ESLint is available in the target project
      const eslintAvailable = await this.isESLintAvailable(context.projectPath);

      if (eslintAvailable) {
        return this.runESLint(context);
      } else {
        return this.runBuiltinRules(context);
      }
    });

    return this.createResult(issues.length === 0, issues, duration);
  }

  // ─── ESLint runner ────────────────────────────────────────────────────────

  private async isESLintAvailable(projectPath: string): Promise<boolean> {
    // Check local node_modules/.bin/eslint
    const localBin = join(projectPath, 'node_modules', '.bin', 'eslint');
    if (await FileSystem.exists(localBin)) return true;

    // Check for eslint config file (user may have global eslint)
    const configFiles = [
      '.eslintrc', '.eslintrc.js', '.eslintrc.cjs', '.eslintrc.json',
      '.eslintrc.yaml', '.eslintrc.yml', 'eslint.config.js', 'eslint.config.mjs',
    ];
    for (const cfg of configFiles) {
      if (await FileSystem.exists(join(projectPath, cfg))) return true;
    }

    return false;
  }

  private async runESLint(context: CheckContext): Promise<Issue[]> {
    const issues: Issue[] = [];

    // Find lint-able files
    const lintFiles = this.getLintableFiles(context.files);
    if (lintFiles.length === 0) return issues;

    try {
      const eslintBin = join(context.projectPath, 'node_modules', '.bin', 'eslint');
      const bin = (await FileSystem.exists(eslintBin)) ? eslintBin : 'eslint';

      // Run ESLint with JSON formatter; ESLint exits 1 on lint errors (normal)
      let output = '';
      try {
        const result = await execFileAsync(
          bin,
          ['--format', 'json', '--no-error-on-unmatched-pattern', ...lintFiles],
          { cwd: context.projectPath, maxBuffer: 10 * 1024 * 1024 }
        );
        output = result.stdout || '';
      } catch (cmdErr: unknown) {
        // ESLint exits with code 1 when it finds lint errors — stdout still has JSON
        const e = cmdErr as { stdout?: string; stderr?: string };
        output = e.stdout || e.stderr || '';
      }
      if (!output.trim().startsWith('[')) {
        // Not JSON — ESLint couldn't parse or no config found
        issues.push(this.createIssue({
          severity: Severity.INFO,
          category: this.category,
          message: 'ESLint found but could not run — no config file detected',
          rule: 'eslint-no-config',
          suggestion: 'Run: npx eslint --init   to create an ESLint config, then re-run devguard check',
        }));
        return issues;
      }

      type ESLintResult = {
        filePath: string;
        messages: Array<{
          ruleId: string | null;
          severity: number; // 1=warn, 2=error
          message: string;
          line: number;
          column: number;
          fix?: { text: string };
        }>;
      };

      const parsed: ESLintResult[] = JSON.parse(output);

      for (const fileResult of parsed) {
        // Make file path relative to project
        const relFile = fileResult.filePath.startsWith(context.projectPath)
          ? fileResult.filePath.slice(context.projectPath.length + 1)
          : fileResult.filePath;

        for (const msg of fileResult.messages) {
          const hasFix = msg.fix !== undefined;
          issues.push(this.createIssue({
            severity: msg.severity === 2 ? Severity.ERROR : Severity.WARNING,
            category: this.category,
            message: `[ESLint] ${msg.message}`,
            file: relFile,
            line: msg.line,
            column: msg.column,
            rule: msg.ruleId ?? 'eslint',
            suggestion: hasFix
              ? `Auto-fixable → run: npx eslint --fix "${relFile}"`
              : `Run: npx eslint "${relFile}"   for details`,
          }));
        }
      }

      return issues;
    } catch (err) {
      // If ESLint completely fails, fall back to built-in rules
      const fallback = await this.runBuiltinRules(context);
      return [
        this.createIssue({
          severity: Severity.INFO,
          category: this.category,
          message: `ESLint execution failed (${(err as Error).message.slice(0, 80)}) — using built-in rules`,
          rule: 'eslint-failed',
          suggestion: 'Ensure ESLint is properly installed: npm install -D eslint',
        }),
        ...fallback,
      ];
    }
  }

  // ─── Built-in rule runner ─────────────────────────────────────────────────

  private async runBuiltinRules(context: CheckContext): Promise<Issue[]> {
    const issues: Issue[] = [];
    const lintFiles = this.getLintableFiles(context.files);

    // First issue: inform user ESLint isn't installed
    issues.push(this.createIssue({
      severity: Severity.INFO,
      category: this.category,
      message: 'ESLint not found — running DevGuard built-in lint rules instead',
      rule: 'no-eslint',
      suggestion:
        'Install ESLint for deeper linting: npm install -D eslint   then run: npx eslint --init',
    }));

    for (const file of lintFiles) {
      // Skip test/spec and type-definition files
      if (
        file.includes('.test.') || file.includes('.spec.') ||
        file.endsWith('.d.ts') || file.includes('node_modules')
      ) continue;

      const fullPath = FileSystem.join(context.projectPath, file);
      const content = await FileSystem.readFile(fullPath);
      const lines = content.split('\n');

      let consecutiveBlanks = 0;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lineNum = i + 1;

        // Track consecutive blank lines for no-multiple-empty-lines
        if (line.trim() === '') {
          consecutiveBlanks++;
          if (consecutiveBlanks === 3) {
            issues.push(this.createIssue({
              severity: Severity.INFO,
              category: this.category,
              message: 'Multiple consecutive blank lines (more than 2)',
              file,
              line: lineNum,
              rule: 'no-multiple-empty-lines',
              suggestion: `Remove extra blank lines. Run: npx prettier --write "${file}"`,
            }));
          }
          continue;
        } else {
          consecutiveBlanks = 0;
        }

        // Skip comment lines for most rules
        const trimmed = line.trim();
        const isComment =
          trimmed.startsWith('//') || trimmed.startsWith('*') ||
          trimmed.startsWith('/*') || trimmed.startsWith('#');

        for (const rule of this.BUILTIN_RULES) {
          // Skip comment-only lines for most rules (except trailing-spaces)
          if (isComment && rule.id !== 'no-trailing-spaces') continue;
          // Skip the no-multiple-empty-lines pattern here (handled above)
          if (rule.id === 'no-multiple-empty-lines') continue;

          if (rule.pattern.test(line)) {
            issues.push(this.createIssue({
              severity: rule.severity,
              category: this.category,
              message: rule.message,
              file,
              line: lineNum,
              rule: rule.id,
              suggestion: rule.suggestion.includes('<file>')
                ? rule.suggestion.replace('<file>', `"${file}"`)
                : `${rule.suggestion}   →   npx eslint --fix "${file}"`,
            }));
          }
        }
      }
    }

    return issues;
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  private getLintableFiles(files: string[]): string[] {
    return files.filter((f) =>
      this.LINT_EXTENSIONS.some((ext) => f.endsWith(ext)) &&
      !f.includes('node_modules') &&
      !f.includes('/dist/') &&
      !f.includes('/build/') &&
      !f.endsWith('.d.ts')
    );
  }
}
