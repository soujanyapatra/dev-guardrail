/**
 * Core types for DevGuard platform
 */

/**
 * Severity levels for issues
 */
export enum Severity {
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info',
}

/**
 * Issue category
 */
export enum Category {
  LINT = 'lint',
  SECURITY = 'security',
  TYPE_SAFETY = 'type-safety',
  COMPLEXITY = 'complexity',
  COVERAGE = 'coverage',
  ARCHITECTURE = 'architecture',
  PERFORMANCE = 'performance',
  DOCUMENTATION = 'documentation',
  FORMATTING = 'formatting',
  TESTING = 'testing',
}

/**
 * Issue detected by a check
 */
export interface Issue {
  id: string;
  severity: Severity;
  category: Category;
  message: string;
  file?: string;
  line?: number;
  column?: number;
  rule?: string;
  suggestion?: string;
  link?: string;
}

/**
 * Result of running a check
 */
export interface CheckResult {
  checkName: string;
  passed: boolean;
  score: number;
  maxScore: number;
  duration: number;
  issues: Issue[];
  metadata?: Record<string, unknown>;
}

/**
 * Overall scan result
 */
export interface ScanResult {
  timestamp: Date;
  projectPath: string;
  projectType: string[];
  overallScore: number;
  grade: string;
  checkResults: CheckResult[];
  summary: {
    totalIssues: number;
    errors: number;
    warnings: number;
    info: number;
    filesScanned: number;
    duration: number;
  };
}

/**
 * Configuration for a check
 */
export interface CheckConfig {
  enabled: boolean;
  severity?: Severity;
  options?: Record<string, unknown>;
}

/**
 * Main DevGuard configuration
 */
export interface DevGuardConfig {
  quality: {
    minimumScore: number;
    failOnError?: boolean;
  };
  checks: {
    lint?: CheckConfig;
    format?: CheckConfig;
    security?: CheckConfig;
    secretScan?: CheckConfig;
    coverage?: CheckConfig;
    deadCode?: CheckConfig;
    duplicateCode?: CheckConfig;
    complexity?: CheckConfig;
    architecture?: CheckConfig;
    dependencyAudit?: CheckConfig;
    performance?: CheckConfig;
    tests?: CheckConfig;
    consoleLog?: CheckConfig;
    todoCheck?: CheckConfig;
    licenseCheck?: CheckConfig;
    customRules?: CheckConfig;
  };
  exclude?: string[];
  include?: string[];
  plugins?: string[];
}

/**
 * Check interface that all checks must implement
 */
export interface Check {
  name: string;
  category: Category;
  description: string;
  enabled: boolean;
  weight: number;
  run(context: CheckContext): Promise<CheckResult>;
}

/**
 * Context passed to checks during execution
 */
export interface CheckContext {
  projectPath: string;
  projectType: string[];
  config: DevGuardConfig;
  files: string[];
  cache: Map<string, unknown>;
}

/**
 * Plugin interface
 */
export interface Plugin {
  name: string;
  version: string;
  description?: string;
  checks: Check[];
  rules?: Rule[];
  scoreWeight?: number;
  initialize?(context: PluginContext): Promise<void>;
  cleanup?(): Promise<void>;
}

/**
 * Context for plugin initialization
 */
export interface PluginContext {
  projectPath: string;
  projectType: string[];
  config: DevGuardConfig;
}

/**
 * Custom rule definition
 */
export interface Rule {
  id: string;
  category: Category;
  severity: Severity;
  message: string;
  pattern?: RegExp;
  check?(file: string, content: string): Issue[];
}

/**
 * Project detection result
 */
export interface ProjectInfo {
  types: string[];
  packageManager: 'npm' | 'yarn' | 'pnpm' | 'pip' | 'composer' | 'pub' | 'unknown';
  language: string[];
  frameworks: string[];
  hasTests: boolean;
  hasDocker: boolean;
  hasCI: boolean;
}

/**
 * Report format
 */
export enum ReportFormat {
  JSON = 'json',
  HTML = 'html',
  MARKDOWN = 'markdown',
  PDF = 'pdf',
  TERMINAL = 'terminal',
}

/**
 * CI platform
 */
export enum CIPlatform {
  GITHUB = 'github',
  GITLAB = 'gitlab',
  BITBUCKET = 'bitbucket',
  AZURE = 'azure',
  AWS = 'aws',
  JENKINS = 'jenkins',
}
