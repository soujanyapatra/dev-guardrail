import { Check, CheckResult, CheckContext, Category, Issue } from '../types/index';

/**
 * Abstract base class for checks
 */
export abstract class BaseCheck implements Check {
  abstract name: string;
  abstract category: Category;
  abstract description: string;
  enabled = true;
  weight = 1.0;

  /**
   * Run the check
   */
  abstract run(context: CheckContext): Promise<CheckResult>;

  /**
   * Create a check result
   */
  protected createResult(
    passed: boolean,
    issues: Issue[],
    duration: number,
    metadata?: Record<string, unknown>
  ): CheckResult {
    const errorCount = issues.filter((i) => i.severity === 'error').length;
    const warningCount = issues.filter((i) => i.severity === 'warning').length;

    // Calculate score based on issues
    const maxScore = 100;
    const score = this.calculateScore(errorCount, warningCount, maxScore);

    return {
      checkName: this.name,
      passed,
      score,
      maxScore,
      duration,
      issues,
      metadata: {
        ...metadata,
        category: this.category,
      },
    };
  }

  /**
   * Calculate score based on issues
   */
  protected calculateScore(
    errorCount: number,
    warningCount: number,
    maxScore: number
  ): number {
    // Errors have more weight than warnings
    const errorPenalty = errorCount * 10;
    const warningPenalty = warningCount * 3;
    const totalPenalty = errorPenalty + warningPenalty;

    const score = Math.max(0, maxScore - totalPenalty);
    return Math.round(score);
  }

  /**
   * Create an issue
   */
  protected createIssue(partial: Omit<Issue, 'id'>): Issue {
    return {
      id: this.generateIssueId(),
      ...partial,
    };
  }

  /**
   * Generate unique issue ID
   */
  private generateIssueId(): string {
    return `${this.name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Measure execution time
   */
  protected async measureTime<T>(fn: () => Promise<T>): Promise<[T, number]> {
    const start = Date.now();
    const result = await fn();
    const duration = Date.now() - start;
    return [result, duration];
  }

  /**
   * Filter files based on patterns
   */
  protected filterFiles(files: string[], patterns: string[]): string[] {
    const regex = patterns.map((p) => new RegExp(p.replace('*', '.*')));
    return files.filter((file) => regex.some((r) => r.test(file)));
  }

  /**
   * Check if check should run
   */
  shouldRun(_context: CheckContext): boolean {
    return this.enabled;
  }
}
