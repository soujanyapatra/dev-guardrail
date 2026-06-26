import { BaseCheck } from './base-check';
import { CheckResult, CheckContext, Category, Severity, Issue } from '../types/index';
import { FileSystem } from '../utils/file-system';

/**
 * Detects performance anti-patterns in JS/TS and PHP code
 */
export class PerformanceCheck extends BaseCheck {
  name = 'performance';
  category = Category.PERFORMANCE;
  description = 'Detects N+1 queries, memory leaks, heavy loops, and performance anti-patterns';

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
        issues.push(...this.checkJSPerformance(content, file));
      }

      const phpFiles = this.filterFiles(context.files, ['**/*.php']);
      for (const file of phpFiles) {
        const fullPath = FileSystem.join(context.projectPath, file);
        const content = await FileSystem.readFile(fullPath);
        issues.push(...this.checkPHPPerformance(content, file));
      }

      return issues;
    });

    return this.createResult(issues.length === 0, issues, duration);
  }

  private checkJSPerformance(content: string, file: string): Issue[] {
    const issues: Issue[] = [];
    const lines = content.split('\n');

    let inLoop = false;
    let loopBraceDepth = 0;
    let braceDepth = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      const openBraces = (line.match(/\{/g) || []).length;
      const closeBraces = (line.match(/\}/g) || []).length;
      braceDepth += openBraces - closeBraces;

      // Detect loop starts
      if (trimmed.match(/\b(for|while|forEach|map|filter|reduce)\b/) && !inLoop) {
        inLoop = true;
        loopBraceDepth = braceDepth;
      }

      if (inLoop) {
        // DOM queries inside loops = big performance hit
        if (trimmed.match(/document\.querySelector|document\.getElementById|document\.getElementsBy/)) {
          issues.push(this.createIssue({
            severity: Severity.WARNING,
            category: this.category,
            message: 'DOM query inside loop — causes repeated layout recalculation',
            file,
            line: i + 1,
            rule: 'no-dom-query-in-loop',
            suggestion: 'Cache the DOM element outside the loop: const el = document.querySelector(…)',
          }));
        }

        // Async calls inside loops without await = fire-and-forget anti-pattern
        if (trimmed.match(/await\s+\w+/) && !file.includes('.test.')) {
          issues.push(this.createIssue({
            severity: Severity.WARNING,
            category: this.category,
            message: 'await inside loop — sequential async calls are slow',
            file,
            line: i + 1,
            rule: 'no-await-in-loop',
            suggestion: 'Use Promise.all() to run async operations concurrently instead of sequentially',
          }));
        }

        if (braceDepth < loopBraceDepth) {
          inLoop = false;
        }
      }

      // JSON.parse in tight loops or repeated calls
      if (trimmed.match(/JSON\.parse\s*\(/) && inLoop) {
        issues.push(this.createIssue({
          severity: Severity.WARNING,
          category: this.category,
          message: 'JSON.parse inside a loop is expensive',
          file,
          line: i + 1,
          rule: 'no-json-parse-in-loop',
          suggestion: 'Parse the JSON outside the loop and reuse the result',
        }));
      }

      // Synchronous file operations (blocking event loop)
      if (trimmed.match(/\bfs\.(readFileSync|writeFileSync|existsSync|readdirSync)\b/)) {
        issues.push(this.createIssue({
          severity: Severity.WARNING,
          category: this.category,
          message: `Synchronous fs call '${trimmed.match(/fs\.(\w+)/)![1]}' blocks the event loop`,
          file,
          line: i + 1,
          rule: 'no-sync-fs',
          suggestion: 'Use the async equivalent: fs.readFile, fs.writeFile, etc. with await',
        }));
      }

      // Potential memory leak: event listeners without cleanup
      if (trimmed.match(/addEventListener\s*\(/) && !file.includes('cleanup')) {
        // Check if there's a corresponding removeEventListener in the file
        if (!content.includes('removeEventListener')) {
          issues.push(this.createIssue({
            severity: Severity.INFO,
            category: this.category,
            message: 'addEventListener without removeEventListener — potential memory leak',
            file,
            line: i + 1,
            rule: 'event-listener-cleanup',
            suggestion: 'Remove event listeners in cleanup/unmount/destroy hooks to prevent memory leaks',
          }));
        }
      }

      // new RegExp inside loop (should be cached)
      if (trimmed.match(/new RegExp\s*\(/) && inLoop) {
        issues.push(this.createIssue({
          severity: Severity.INFO,
          category: this.category,
          message: 'new RegExp() inside loop — recompiles regex on every iteration',
          file,
          line: i + 1,
          rule: 'no-regexp-in-loop',
          suggestion: 'Move regex instantiation outside the loop: const regex = new RegExp(…)',
        }));
      }
    }

    return issues;
  }

  private checkPHPPerformance(content: string, file: string): Issue[] {
    const issues: Issue[] = [];
    const lines = content.split('\n');

    let inLoop = false;
    let braceDepth = 0;
    let loopBraceDepth = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      const openBraces = (line.match(/\{/g) || []).length;
      const closeBraces = (line.match(/\}/g) || []).length;
      braceDepth += openBraces - closeBraces;

      if (trimmed.match(/\b(foreach|for|while)\b/) && !inLoop) {
        inLoop = true;
        loopBraceDepth = braceDepth;
      }

      if (inLoop) {
        // N+1 query problem: DB call inside loop
        if (trimmed.match(/(?:DB::|->where\(|->find\(|->first\(|->get\()/)) {
          issues.push(this.createIssue({
            severity: Severity.ERROR,
            category: this.category,
            message: 'N+1 query problem — database call inside a loop executes one query per iteration',
            file,
            line: i + 1,
            rule: 'no-n-plus-1-query',
            suggestion: 'Use Eloquent eager loading: with(\'relation\') or whereIn() to batch queries',
            link: 'https://laravel.com/docs/eloquent-relationships#eager-loading',
          }));
        }

        // count() in foreach condition recalculates every iteration
        if (trimmed.match(/for\s*\(.*count\s*\(\$\w+\)/)) {
          issues.push(this.createIssue({
            severity: Severity.WARNING,
            category: this.category,
            message: 'count() in for loop condition — recalculated every iteration',
            file,
            line: i + 1,
            rule: 'no-count-in-loop',
            suggestion: 'Cache count: $total = count($arr); for($i = 0; $i < $total; $i++)',
          }));
        }

        if (braceDepth < loopBraceDepth) {
          inLoop = false;
        }
      }

      // Detect sleep() in non-test code (blocks the process)
      if (trimmed.match(/\bsleep\s*\(/) || trimmed.match(/\busleep\s*\(/)) {
        issues.push(this.createIssue({
          severity: Severity.WARNING,
          category: this.category,
          message: 'sleep()/usleep() blocks the PHP process — use queued jobs for delays',
          file,
          line: i + 1,
          rule: 'no-blocking-sleep',
          suggestion: 'Use Laravel queues with delay() for deferred work instead of sleep()',
          link: 'https://laravel.com/docs/queues#delayed-dispatching',
        }));
      }

      // Detect expensive operations: file_get_contents without caching
      if (trimmed.match(/file_get_contents\s*\(/) && !content.includes('Cache::') && !content.includes('cache(')) {
        issues.push(this.createIssue({
          severity: Severity.INFO,
          category: this.category,
          message: 'file_get_contents without caching — consider caching expensive I/O',
          file,
          line: i + 1,
          rule: 'cache-io-operations',
          suggestion: 'Use Cache::remember() to cache the result: Cache::remember(\'key\', 3600, fn() => ...)',
          link: 'https://laravel.com/docs/cache#retrieving-storing',
        }));
      }
    }

    return issues;
  }
}
