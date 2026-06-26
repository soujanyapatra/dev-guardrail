import { ConfigManager } from './config/config-manager';
import { PluginManager } from './plugin/plugin-manager';
import { Scanner } from './scanner/scanner';
import { ProjectDetector } from './detector/project-detector';
import { DevGuardConfig, ScanResult } from './types/index';
import { ScoringEngine } from './scoring/scoring-engine';
import { Logger } from './utils/logger';
import { FileSystem } from './utils/file-system';
import { ConsoleLogCheck } from './checks/console-log-check';
import { LargeFileCheck } from './checks/large-file-check';
import { TodoCheck } from './checks/todo-check';
import { PHPDebugCheck } from './checks/php-debug-check';
import { PHPTodoCheck } from './checks/php-todo-check';
import { PHPSyntaxCheck } from './checks/php-syntax-check';
import { PHPLongMethodCheck } from './checks/php-long-method-check';
import { SecretDetectionCheck } from './checks/secret-detection-check';
import { NamingConventionCheck } from './checks/naming-convention-check';
import { ErrorHandlingCheck } from './checks/error-handling-check';
import { SecurityPatternCheck } from './checks/security-pattern-check';
import { ComplexityCheck } from './checks/complexity-check';
import { DeadCodeCheck } from './checks/dead-code-check';
import { PerformanceCheck } from './checks/performance-check';
import { LintCheck } from './checks/lint-check';

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
   * Get category scores from scan result
   */
  async getCategoryScores(result: ScanResult): Promise<Record<string, number>> {
    const scoringEngine = new ScoringEngine();
    return scoringEngine.getCategoryScores(result);
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
    const detector = new ProjectDetector(this.projectPath);
    const projectInfo = await detector.detect();
    
    const checks = [];
    
    // Core security checks (always enabled)
    checks.push(new SecretDetectionCheck());
    checks.push(new SecurityPatternCheck());
    
    // JavaScript/TypeScript checks
    checks.push(new ConsoleLogCheck());
    checks.push(new LargeFileCheck());
    checks.push(new ErrorHandlingCheck());
    checks.push(new NamingConventionCheck());

    // Deep analysis checks (always enabled)
    checks.push(new ComplexityCheck());
    checks.push(new DeadCodeCheck());
    checks.push(new PerformanceCheck());

    // Linting check — tries ESLint first, falls back to built-in rules
    checks.push(new LintCheck());
    
    if (config.checks.todoCheck?.enabled) {
      checks.push(new TodoCheck());
    }
    
    // PHP checks (if PHP project detected)
    if (projectInfo.language.includes('php')) {
      this.logger.info('PHP project detected - enabling PHP checks');
      checks.push(new PHPDebugCheck());
      checks.push(new PHPSyntaxCheck());
      checks.push(new PHPLongMethodCheck());
      
      if (config.checks.todoCheck?.enabled) {
        checks.push(new PHPTodoCheck());
      }
    }

    const nativePlugin = {
      name: '@devguard/native',
      version: '0.4.0',
      description: 'Native DevGuard checks: security, complexity, dead code, performance, naming, error handling',
      checks,
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
   * Generate HTML report — full premium dashboard
   */
  private async generateHTMLReport(result: ScanResult, output: string): Promise<void> {
    // Ensure reports directory exists
    const dir = FileSystem.join(this.projectPath, 'reports');
    await FileSystem.mkdir(dir);

    // Safe timestamp: ScanResult.timestamp may be a Date or a string (after JSON round-trip)
    const ts = result.timestamp instanceof Date
      ? result.timestamp.toISOString()
      : new Date(result.timestamp as unknown as string).toISOString();

    // Category scores
    const scoringEngine = new ScoringEngine();
    const categoryScores = scoringEngine.getCategoryScores(result);

    const scoreColor = (s: number) =>
      s >= 90 ? '#22c55e' : s >= 75 ? '#f59e0b' : s >= 60 ? '#f97316' : '#ef4444';

    const severityBadge = (sev: string) => {
      const map: Record<string, string> = {
        error: 'background:#fee2e2;color:#dc2626;',
        warning: 'background:#fef3c7;color:#d97706;',
        info: 'background:#dbeafe;color:#2563eb;',
      };
      return `<span style="padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:700;${map[sev] || ''}">${sev.toUpperCase()}</span>`;
    };

    const categoryBars = Object.entries(categoryScores)
      .map(([cat, score]) => {
        const pct = Math.min(100, Math.max(0, score));
        const color = scoreColor(pct);
        return `
        <div style="margin-bottom:14px">
          <div style="display:flex;justify-content:space-between;margin-bottom:4px">
            <span style="font-size:13px;font-weight:600;color:#374151;text-transform:capitalize">${cat}</span>
            <span style="font-size:13px;font-weight:700;color:${color}">${pct}%</span>
          </div>
          <div style="background:#f3f4f6;border-radius:8px;height:10px;overflow:hidden">
            <div style="width:${pct}%;height:100%;background:${color};border-radius:8px;transition:width 0.6s ease"></div>
          </div>
        </div>`;
      })
      .join('');

    // Group issues by severity
    const allIssues = result.checkResults.flatMap(r => r.issues);
    const errors   = allIssues.filter(i => i.severity === 'error');
    const warnings = allIssues.filter(i => i.severity === 'warning');
    const infos    = allIssues.filter(i => i.severity === 'info');

    const issueRows = allIssues.map((issue, idx) => {
      const file = issue.file ? `${issue.file}${issue.line ? ':' + issue.line : ''}` : '—';
      const suggestion = issue.suggestion
        ? `<div style="font-size:12px;color:#6b7280;margin-top:3px">💡 ${issue.suggestion}</div>`
        : '';
      return `
      <tr class="issue-row" data-severity="${issue.severity}" style="${idx % 2 === 0 ? 'background:#f9fafb' : 'background:#fff'}">
        <td style="padding:10px 12px;vertical-align:top">${severityBadge(issue.severity)}</td>
        <td style="padding:10px 12px;vertical-align:top;font-size:13px;color:#111827;max-width:420px">
          ${issue.message}${suggestion}
        </td>
        <td style="padding:10px 12px;vertical-align:top;font-size:12px;color:#6b7280;font-family:monospace;white-space:nowrap">${file}</td>
        <td style="padding:10px 12px;vertical-align:top;font-size:12px;color:#6b7280">${issue.rule || '—'}</td>
      </tr>`;
    }).join('');

    // Check rows
    const checkRows = result.checkResults.map((cr, idx) => {
      const pct = cr.maxScore > 0 ? Math.round((cr.score / cr.maxScore) * 100) : 100;
      const color = scoreColor(pct);
      return `
      <tr style="${idx % 2 === 0 ? 'background:#f9fafb' : 'background:#fff'}">
        <td style="padding:8px 12px;font-size:13px;font-weight:600;color:#374151">${cr.checkName}</td>
        <td style="padding:8px 12px">
          <div style="display:flex;align-items:center;gap:8px">
            <div style="flex:1;background:#e5e7eb;border-radius:8px;height:8px;overflow:hidden">
              <div style="width:${pct}%;height:100%;background:${color};border-radius:8px"></div>
            </div>
            <span style="font-size:12px;font-weight:700;color:${color};min-width:35px">${pct}%</span>
          </div>
        </td>
        <td style="padding:8px 12px;font-size:12px;color:#6b7280;text-align:center">${cr.issues.length}</td>
        <td style="padding:8px 12px;font-size:12px;color:#6b7280;text-align:center">${cr.duration}ms</td>
        <td style="padding:8px 12px;text-align:center">${cr.passed
          ? '<span style="color:#22c55e;font-size:16px">✔</span>'
          : '<span style="color:#ef4444;font-size:16px">✖</span>'}</td>
      </tr>`;
    }).join('');

    const overallPct = result.overallScore;
    const mainColor = scoreColor(overallPct);
    const circumference = 2 * Math.PI * 54; // r=54
    const dashOffset = circumference - (overallPct / 100) * circumference;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DevGuard Quality Report</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif; background: #f1f5f9; color: #1e293b; }
    .page { max-width: 1100px; margin: 0 auto; padding: 32px 20px; }
    .header { background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%); border-radius: 16px; padding: 32px; margin-bottom: 24px; color: white; display: flex; align-items: center; gap: 32px; }
    .header-text h1 { font-size: 28px; font-weight: 800; margin-bottom: 4px; }
    .header-text p { font-size: 14px; opacity: 0.65; }
    .cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 16px; margin-bottom: 24px; }
    .card { background: white; border-radius: 12px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,.08); }
    .card-label { font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: .05em; margin-bottom: 6px; }
    .card-value { font-size: 32px; font-weight: 800; }
    .panel { background: white; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,.08); margin-bottom: 24px; overflow: hidden; }
    .panel-header { padding: 18px 20px; border-bottom: 1px solid #f1f5f9; display: flex; align-items: center; justify-content: space-between; }
    .panel-title { font-size: 16px; font-weight: 700; color: #111827; }
    .panel-body { padding: 20px; }
    table { width: 100%; border-collapse: collapse; }
    th { padding: 10px 12px; font-size: 11px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: .06em; text-align: left; background: #f8fafc; border-bottom: 1px solid #e5e7eb; }
    tr { transition: background 0.15s; }
    .filter-bar { display: flex; gap: 8px; flex-wrap: wrap; }
    .filter-btn { padding: 6px 14px; border-radius: 8px; border: 1.5px solid #e5e7eb; background: white; font-size: 12px; font-weight: 600; cursor: pointer; color: #374151; transition: all .15s; }
    .filter-btn.active { border-color: #3b82f6; background: #eff6ff; color: #1d4ed8; }
    .hidden { display: none !important; }
    .footer { text-align: center; font-size: 12px; color: #94a3b8; margin-top: 32px; }
    @media (max-width: 600px) { .header { flex-direction: column; text-align: center; } }
  </style>
</head>
<body>
  <div class="page">

    <!-- Header -->
    <div class="header">
      <svg width="120" height="120" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="10"/>
        <circle cx="60" cy="60" r="54" fill="none" stroke="${mainColor}" stroke-width="10"
          stroke-dasharray="${circumference}" stroke-dashoffset="${dashOffset}"
          stroke-linecap="round" transform="rotate(-90 60 60)"/>
        <text x="60" y="55" text-anchor="middle" font-size="26" font-weight="800" fill="white">${overallPct}%</text>
        <text x="60" y="74" text-anchor="middle" font-size="14" font-weight="700" fill="${mainColor}">Grade ${result.grade}</text>
      </svg>
      <div class="header-text">
        <h1>DevGuard Quality Report</h1>
        <p>Generated: ${ts}</p>
        <p style="margin-top:8px;font-size:13px;opacity:.8">Project: ${result.projectPath}</p>
        ${result.projectType.length > 0
          ? `<p style="font-size:12px;opacity:.6;margin-top:4px">Type: ${result.projectType.join(', ')}</p>`
          : ''}
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="cards">
      <div class="card">
        <div class="card-label">Files Scanned</div>
        <div class="card-value" style="color:#3b82f6">${result.summary.filesScanned}</div>
      </div>
      <div class="card">
        <div class="card-label">Total Issues</div>
        <div class="card-value" style="color:#6b7280">${result.summary.totalIssues}</div>
      </div>
      <div class="card">
        <div class="card-label">Errors</div>
        <div class="card-value" style="color:#ef4444">${result.summary.errors}</div>
      </div>
      <div class="card">
        <div class="card-label">Warnings</div>
        <div class="card-value" style="color:#f59e0b">${result.summary.warnings}</div>
      </div>
      <div class="card">
        <div class="card-label">Info</div>
        <div class="card-value" style="color:#3b82f6">${result.summary.info}</div>
      </div>
      <div class="card">
        <div class="card-label">Duration</div>
        <div class="card-value" style="color:#8b5cf6;font-size:22px">${(result.summary.duration / 1000).toFixed(2)}s</div>
      </div>
    </div>

    <!-- Category Scores -->
    <div class="panel">
      <div class="panel-header">
        <span class="panel-title">📊 Quality Breakdown by Category</span>
      </div>
      <div class="panel-body">
        ${categoryBars || '<p style="color:#6b7280;font-size:14px">No category data available</p>'}
      </div>
    </div>

    <!-- Checks Overview -->
    <div class="panel">
      <div class="panel-header">
        <span class="panel-title">🔍 Check Results (${result.checkResults.length} checks run)</span>
      </div>
      <table>
        <thead>
          <tr>
            <th>Check</th>
            <th style="min-width:180px">Score</th>
            <th style="text-align:center">Issues</th>
            <th style="text-align:center">Duration</th>
            <th style="text-align:center">Passed</th>
          </tr>
        </thead>
        <tbody>${checkRows || '<tr><td colspan="5" style="padding:20px;text-align:center;color:#6b7280">No checks ran</td></tr>'}</tbody>
      </table>
    </div>

    <!-- Issues Table -->
    <div class="panel">
      <div class="panel-header">
        <span class="panel-title">🐛 All Issues (${allIssues.length})</span>
        <div class="filter-bar">
          <button class="filter-btn active" onclick="filterIssues('all', this)">All (${allIssues.length})</button>
          <button class="filter-btn" onclick="filterIssues('error', this)" style="color:#dc2626">Errors (${errors.length})</button>
          <button class="filter-btn" onclick="filterIssues('warning', this)" style="color:#d97706">Warnings (${warnings.length})</button>
          <button class="filter-btn" onclick="filterIssues('info', this)" style="color:#2563eb">Info (${infos.length})</button>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th style="width:90px">Severity</th>
            <th>Message</th>
            <th>File / Line</th>
            <th>Rule</th>
          </tr>
        </thead>
        <tbody id="issues-body">
          ${issueRows || '<tr><td colspan="4" style="padding:30px;text-align:center;color:#22c55e;font-weight:700;font-size:16px">🎉 No issues found!</td></tr>'}
        </tbody>
      </table>
    </div>

    <div class="footer">Generated by <strong>DevGuard</strong> v0.4.0 · <a href="https://github.com/devguard" style="color:#3b82f6">devguard</a></div>
  </div>

  <script>
    function filterIssues(severity, btn) {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('.issue-row').forEach(row => {
        if (severity === 'all' || row.dataset.severity === severity) {
          row.classList.remove('hidden');
        } else {
          row.classList.add('hidden');
        }
      });
    }
  </script>
</body>
</html>`;

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
