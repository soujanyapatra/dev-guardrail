import { ConfigManager } from './config/config-manager.js';
import { PluginManager } from './plugin/plugin-manager.js';
import { Scanner } from './scanner/scanner.js';
import { ProjectDetector } from './detector/project-detector.js';
import { DevGuardConfig, ScanResult, ReportFormat } from './types/index.js';
import { Logger } from './utils/logger.js';
import { FileSystem } from './utils/file-system.js';
import { ConsoleLogCheck } from './checks/console-log-check.js';
import { LargeFileCheck } from './checks/large-file-check.js';
import { TodoCheck } from './checks/todo-check.js';

/**
 * Main DevGuard class
 */
export class DevGuard {
  private projectPath: string;
  private configManager: ConfigManager;
  private pluginManager: PluginManager | null = null;
  private logger: Logger;

  constructor(projectPath: string, logger: Logger = new Logger()) {
    this.projectPath = projectPath;
    this.configManager = new ConfigManager(projectPath);
    this.logger = logger;
  }

  /**
   * Initialize DevGuard in project
   */
  async init(force = false): Promise<void> {
    const configPath = this.configManager.getConfigPath();
    const exists = await FileSystem.exists(configPath);

    if (exists && !force) {
      this.logger.warning('DevGuard is already initialized');
      this.logger.info('Use --force to overwrite existing configuration');
      return;
    }

    // Detect project info
    this.logger.info('Detecting project...');
    const detector = new ProjectDetector(this.projectPath);
    const projectInfo = await detector.detect();

    this.logger.success(`Detected: ${projectInfo.frameworks.join(', ') || 'Generic project'}`);
    this.logger.info(`Languages: ${projectInfo.language.join(', ')}`);
    this.logger.info(`Package Manager: ${projectInfo.packageManager}`);

    // Generate configuration
    await this.configManager.init();
    this.logger.success('Configuration file created');

    // Create reports directory
    const reportsDir = FileSystem.join(this.projectPath, 'reports');
    await FileSystem.mkdir(reportsDir);
    this.logger.success('Reports directory created');
  }

  /**
   * Run quality checks
   */
  async check(): Promise<ScanResult> {
    const config = await this.configManager.load();
    const pluginManager = await this.getPluginManager();

    // Register native checks
    await this.registerNativeChecks(pluginManager, config);

    // Create scanner
    const scanner = new Scanner(this.projectPath, config, pluginManager, this.logger);

    // Run scan
    return scanner.scan();
  }

  /**
   * Generate report
   */
  async report(format: string = 'json', outputPath?: string): Promise<void> {
    const result = await this.check();

    const output =
      outputPath || FileSystem.join(this.projectPath, 'reports', `report.${format}`);

    switch (format.toLowerCase()) {
      case 'json':
        await this.generateJSONReport(result, output);
        break;
      case 'html':
        await this.generateHTMLReport(result, output);
        break;
      case 'markdown':
        await this.generateMarkdownReport(result, output);
        break;
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  /**
   * Diagnose setup
   */
  async doctor(): Promise<void> {
    const checks = [];

    // Check if initialized
    const configExists = await FileSystem.exists(this.configManager.getConfigPath());
    checks.push({
      name: 'Configuration',
      status: configExists ? 'OK' : 'Missing',
    });

    // Check project detection
    try {
      const detector = new ProjectDetector(this.projectPath);
      const info = await detector.detect();
      checks.push({
        name: 'Project Detection',
        status: info.types.length > 0 ? 'OK' : 'Unknown',
      });
    } catch {
      checks.push({
        name: 'Project Detection',
        status: 'Failed',
      });
    }

    // Check for node_modules
    const nodeModulesExists = await FileSystem.exists(
      FileSystem.join(this.projectPath, 'node_modules')
    );
    checks.push({
      name: 'Dependencies',
      status: nodeModulesExists ? 'OK' : 'Not Installed',
    });

    this.logger.table(checks);
  }

  /**
   * Install Git hooks
   */
  async installHooks(): Promise<void> {
    const hooksDir = FileSystem.join(this.projectPath, '.git', 'hooks');
    
    if (!(await FileSystem.exists(FileSystem.join(this.projectPath, '.git')))) {
      throw new Error('Not a git repository');
    }

    // Create hooks directory if needed
    await FileSystem.mkdir(hooksDir);

    // Pre-commit hook
    const preCommitHook = `#!/bin/sh
# DevGuard pre-commit hook
echo "Running DevGuard checks..."
npx devguard check --ci
`;

    await FileSystem.writeFile(
      FileSystem.join(hooksDir, 'pre-commit'),
      preCommitHook
    );

    this.logger.info('Git hooks installed');
  }

  /**
   * Uninstall Git hooks
   */
  async uninstallHooks(): Promise<void> {
    const preCommitPath = FileSystem.join(this.projectPath, '.git', 'hooks', 'pre-commit');
    
    if (await FileSystem.exists(preCommitPath)) {
      await FileSystem.delete(preCommitPath);
    }
  }

  /**
   * List installed plugins
   */
  async listPlugins(): Promise<Array<{ name: string; version: string; checks: number }>> {
    const pluginManager = await this.getPluginManager();
    const stats = pluginManager.getStatistics();
    return stats.pluginList;
  }

  /**
   * Get configuration
   */
  async getConfig(): Promise<DevGuardConfig> {
    return this.configManager.load();
  }

  /**
   * Get or create plugin manager
   */
  private async getPluginManager(): Promise<PluginManager> {
    if (this.pluginManager) {
      return this.pluginManager;
    }

    const config = await this.configManager.load();
    const detector = new ProjectDetector(this.projectPath);
    const projectInfo = await detector.detect();

    this.pluginManager = new PluginManager(
      {
        projectPath: this.projectPath,
        projectType: projectInfo.types,
        config,
      },
      this.logger
    );

    // Load plugins from config
    if (config.plugins && config.plugins.length > 0) {
      await this.pluginManager.loadPlugins(config.plugins);
    }

    return this.pluginManager;
  }

  /**
   * Register native DevGuard checks
   */
  private async registerNativeChecks(
    pluginManager: PluginManager,
    config: DevGuardConfig
  ): Promise<void> {
    const nativePlugin = {
      name: '@devguard/native',
      version: '0.1.0',
      description: 'Native DevGuard checks',
      checks: [
        new ConsoleLogCheck(),
        new LargeFileCheck(),
        ...(config.checks.todoCheck?.enabled ? [new TodoCheck()] : []),
      ],
    };

    await pluginManager.register(nativePlugin);
  }

  /**
   * Generate JSON report
   */
  private async generateJSONReport(result: ScanResult, output: string): Promise<void> {
    await FileSystem.writeJSON(output, result);
  }

  /**
   * Generate HTML report
   */
  private async generateHTMLReport(result: ScanResult, output: string): Promise<void> {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <title>DevGuard Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
    .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
    h1 { color: #333; }
    .score { font-size: 48px; color: #4CAF50; font-weight: bold; }
    .grade { font-size: 32px; color: #2196F3; }
    .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin: 20px 0; }
    .card { background: #f9f9f9; padding: 15px; border-radius: 4px; }
    .card h3 { margin: 0 0 10px 0; color: #666; }
    .card .value { font-size: 24px; font-weight: bold; }
    .error { color: #f44336; }
    .warning { color: #ff9800; }
    .info { color: #2196F3; }
    .issue { padding: 10px; margin: 5px 0; background: #f9f9f9; border-left: 4px solid #ddd; }
    .issue.error { border-left-color: #f44336; }
    .issue.warning { border-left-color: #ff9800; }
  </style>
</head>
<body>
  <div class="container">
    <h1>DevGuard Quality Report</h1>
    <p>Generated: ${result.timestamp.toISOString()}</p>
    
    <div>
      <span class="score">${result.overallScore}%</span>
      <span class="grade">Grade ${result.grade}</span>
    </div>
    
    <div class="summary">
      <div class="card">
        <h3>Files Scanned</h3>
        <div class="value">${result.summary.filesScanned}</div>
      </div>
      <div class="card">
        <h3>Total Issues</h3>
        <div class="value">${result.summary.totalIssues}</div>
      </div>
      <div class="card">
        <h3>Errors</h3>
        <div class="value error">${result.summary.errors}</div>
      </div>
      <div class="card">
        <h3>Warnings</h3>
        <div class="value warning">${result.summary.warnings}</div>
      </div>
    </div>
    
    <h2>Issues</h2>
    ${result.checkResults
      .flatMap((r) => r.issues)
      .map(
        (issue) => `
      <div class="issue ${issue.severity}">
        <strong>${issue.severity.toUpperCase()}</strong>: ${issue.message}
        ${issue.file ? `<br><small>${issue.file}:${issue.line || '?'}</small>` : ''}
        ${issue.suggestion ? `<br><em>${issue.suggestion}</em>` : ''}
      </div>
    `
      )
      .join('')}
  </div>
</body>
</html>
    `;

    await FileSystem.writeFile(output, html);
  }

  /**
   * Generate Markdown report
   */
  private async generateMarkdownReport(result: ScanResult, output: string): Promise<void> {
    const md = `# DevGuard Quality Report

**Generated:** ${result.timestamp.toISOString()}

## Overall Score: ${result.overallScore}% (Grade ${result.grade})

### Summary
- **Files Scanned:** ${result.summary.filesScanned}
- **Total Issues:** ${result.summary.totalIssues}
- **Errors:** ${result.summary.errors}
- **Warnings:** ${result.summary.warnings}
- **Info:** ${result.summary.info}
- **Duration:** ${result.summary.duration}ms

## Issues

${result.checkResults
  .flatMap((r) => r.issues)
  .map(
    (issue) => `
### ${issue.severity.toUpperCase()}: ${issue.message}
${issue.file ? `**File:** ${issue.file}:${issue.line || '?'}` : ''}
${issue.suggestion ? `**Suggestion:** ${issue.suggestion}` : ''}
`
  )
  .join('\n')}
`;

    await FileSystem.writeFile(output, md);
  }
}
