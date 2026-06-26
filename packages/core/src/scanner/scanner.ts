import pLimit from 'p-limit';
import { CheckContext, ScanResult, DevGuardConfig } from '../types/index.js';
import { PluginManager } from '../plugin/plugin-manager.js';
import { ScoringEngine } from '../scoring/scoring-engine.js';
import { FileSystem } from '../utils/file-system.js';
import { Logger } from '../utils/logger.js';

/**
 * Main scanner that orchestrates all checks
 */
export class Scanner {
  private projectPath: string;
  private config: DevGuardConfig;
  private pluginManager: PluginManager;
  private scoringEngine: ScoringEngine;
  private logger: Logger;

  constructor(
    projectPath: string,
    config: DevGuardConfig,
    pluginManager: PluginManager,
    logger: Logger = new Logger()
  ) {
    this.projectPath = projectPath;
    this.config = config;
    this.pluginManager = pluginManager;
    this.scoringEngine = new ScoringEngine();
    this.logger = logger;
  }

  /**
   * Run all checks and produce scan result
   */
  async scan(): Promise<ScanResult> {
    const startTime = Date.now();

    this.logger.heading('DevGuard - Quality Scan');
    this.logger.divider();

    // Find files to scan
    const files = await this.findFiles();
    this.logger.info(`Found ${files.length} files to scan`);

    // Get all checks from plugins
    const checks = this.pluginManager.getAllChecks().filter((c) => c.enabled);
    this.logger.info(`Running ${checks.length} checks`);

    // Create check context
    const context: CheckContext = {
      projectPath: this.projectPath,
      projectType: [], // Will be populated by project detector
      config: this.config,
      files,
      cache: new Map(),
    };

    // Run checks in parallel with concurrency limit
    const limit = pLimit(5); // Run max 5 checks concurrently
    const checkPromises = checks.map((check) =>
      limit(async () => {
        this.logger.debug(`Running check: ${check.name}`);
        try {
          const result = await check.run(context);
          this.logger.success(
            `✓ ${check.name} (${result.issues.length} issues, ${result.duration}ms)`
          );
          return result;
        } catch (error) {
          this.logger.error(`✗ ${check.name} failed: ${(error as Error).message}`);
          return {
            checkName: check.name,
            passed: false,
            score: 0,
            maxScore: 100,
            duration: 0,
            issues: [],
          };
        }
      })
    );

    const checkResults = await Promise.all(checkPromises);

    // Calculate overall score
    const overallScore = this.scoringEngine.calculateScore(checkResults);
    const grade = this.scoringEngine.getGrade(overallScore);

    // Calculate summary
    const totalIssues = checkResults.reduce((sum, r) => sum + r.issues.length, 0);
    const errors = checkResults.reduce(
      (sum, r) => sum + r.issues.filter((i) => i.severity === 'error').length,
      0
    );
    const warnings = checkResults.reduce(
      (sum, r) => sum + r.issues.filter((i) => i.severity === 'warning').length,
      0
    );
    const info = checkResults.reduce(
      (sum, r) => sum + r.issues.filter((i) => i.severity === 'info').length,
      0
    );

    const duration = Date.now() - startTime;

    const scanResult: ScanResult = {
      timestamp: new Date(),
      projectPath: this.projectPath,
      projectType: context.projectType,
      overallScore,
      grade,
      checkResults,
      summary: {
        totalIssues,
        errors,
        warnings,
        info,
        filesScanned: files.length,
        duration,
      },
    };

    return scanResult;
  }

  /**
   * Find files to scan
   */
  private async findFiles(): Promise<string[]> {
    const includePatterns = this.config.include || ['**/*'];
    const excludePatterns = this.config.exclude || [];

    return FileSystem.findFiles(includePatterns, {
      cwd: this.projectPath,
      ignore: excludePatterns,
    });
  }
}
