import { CheckResult, ScanResult, Category } from '../types/index.js';

/**
 * Scoring weights for each category
 */
const DEFAULT_WEIGHTS: Record<Category, number> = {
  [Category.SECURITY]: 0.20,
  [Category.TYPE_SAFETY]: 0.15,
  [Category.LINT]: 0.15,
  [Category.COVERAGE]: 0.10,
  [Category.ARCHITECTURE]: 0.10,
  [Category.COMPLEXITY]: 0.10,
  [Category.PERFORMANCE]: 0.05,
  [Category.DOCUMENTATION]: 0.05,
  [Category.FORMATTING]: 0.05,
  [Category.TESTING]: 0.05,
};

/**
 * Calculates overall quality score and grade
 */
export class ScoringEngine {
  private weights: Record<Category, number>;

  constructor(customWeights?: Partial<Record<Category, number>>) {
    this.weights = { ...DEFAULT_WEIGHTS, ...customWeights };
  }

  /**
   * Calculate overall score from check results
   */
  calculateScore(checkResults: CheckResult[]): number {
    if (checkResults.length === 0) return 0;

    let totalWeightedScore = 0;
    let totalWeight = 0;

    // Group results by category
    const categoryScores = this.groupByCategory(checkResults);

    for (const [category, results] of Object.entries(categoryScores)) {
      const categoryScore = this.calculateCategoryScore(results);
      const weight = this.weights[category as Category] || 0;

      totalWeightedScore += categoryScore * weight;
      totalWeight += weight;
    }

    return totalWeight > 0 ? Math.round(totalWeightedScore / totalWeight) : 0;
  }

  /**
   * Get letter grade from score
   */
  getGrade(score: number): string {
    if (score >= 95) return 'A+';
    if (score >= 90) return 'A';
    if (score >= 85) return 'A-';
    if (score >= 80) return 'B+';
    if (score >= 75) return 'B';
    if (score >= 70) return 'B-';
    if (score >= 65) return 'C+';
    if (score >= 60) return 'C';
    if (score >= 55) return 'C-';
    if (score >= 50) return 'D';
    return 'F';
  }

  /**
   * Get health description from score
   */
  getHealthDescription(score: number): string {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Good';
    if (score >= 70) return 'Fair';
    if (score >= 60) return 'Needs Improvement';
    return 'Poor';
  }

  /**
   * Calculate category-specific score
   */
  private calculateCategoryScore(results: CheckResult[]): number {
    if (results.length === 0) return 0;

    let totalScore = 0;
    let totalMax = 0;

    for (const result of results) {
      totalScore += result.score;
      totalMax += result.maxScore;
    }

    return totalMax > 0 ? (totalScore / totalMax) * 100 : 0;
  }

  /**
   * Group check results by category
   */
  private groupByCategory(
    checkResults: CheckResult[]
  ): Record<string, CheckResult[]> {
    const grouped: Record<string, CheckResult[]> = {};

    for (const result of checkResults) {
      // Extract category from check name or metadata
      const category = this.extractCategory(result);
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(result);
    }

    return grouped;
  }

  /**
   * Extract category from check result
   */
  private extractCategory(result: CheckResult): string {
    // Try to extract from metadata first
    if (result.metadata?.category) {
      return result.metadata.category as string;
    }

    // Fallback to name-based detection
    const name = result.checkName.toLowerCase();
    if (name.includes('security') || name.includes('secret'))
      return Category.SECURITY;
    if (name.includes('type') || name.includes('typescript'))
      return Category.TYPE_SAFETY;
    if (name.includes('lint') || name.includes('eslint'))
      return Category.LINT;
    if (name.includes('coverage')) return Category.COVERAGE;
    if (name.includes('architecture') || name.includes('dependency'))
      return Category.ARCHITECTURE;
    if (name.includes('complexity') || name.includes('cyclomatic'))
      return Category.COMPLEXITY;
    if (name.includes('performance')) return Category.PERFORMANCE;
    if (name.includes('doc')) return Category.DOCUMENTATION;
    if (name.includes('format') || name.includes('prettier'))
      return Category.FORMATTING;
    if (name.includes('test')) return Category.TESTING;

    return Category.LINT; // Default
  }

  /**
   * Get category scores from scan result
   */
  getCategoryScores(scanResult: ScanResult): Record<string, number> {
    const grouped = this.groupByCategory(scanResult.checkResults);
    const scores: Record<string, number> = {};

    for (const [category, results] of Object.entries(grouped)) {
      scores[category] = Math.round(this.calculateCategoryScore(results));
    }

    return scores;
  }

  /**
   * Get trend indicator (for future comparison)
   */
  getTrend(currentScore: number, previousScore?: number): string {
    if (!previousScore) return '→';
    if (currentScore > previousScore) return '↑';
    if (currentScore < previousScore) return '↓';
    return '→';
  }
}
