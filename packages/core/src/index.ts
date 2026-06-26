/**
 * DevGuard Core
 * Production-grade engineering quality platform
 */

export { DevGuard } from './devguard';
export { ConfigManager } from './config/config-manager';
export { PluginManager } from './plugin/plugin-manager';
export { Scanner } from './scanner/scanner';
export { ProjectDetector } from './detector/project-detector';
export { ScoringEngine } from './scoring/scoring-engine';

// Checks
export { BaseCheck } from './checks/base-check';
export { ConsoleLogCheck } from './checks/console-log-check';
export { LargeFileCheck } from './checks/large-file-check';
export { TodoCheck } from './checks/todo-check';
export { PHPDebugCheck } from './checks/php-debug-check';
export { PHPTodoCheck } from './checks/php-todo-check';
export { PHPSyntaxCheck } from './checks/php-syntax-check';
export { PHPLongMethodCheck } from './checks/php-long-method-check';
export { ComplexityCheck } from './checks/complexity-check';
export { DeadCodeCheck } from './checks/dead-code-check';
export { PerformanceCheck } from './checks/performance-check';
export { LintCheck } from './checks/lint-check';

// Utilities
export { Logger } from './utils/logger';
export { FileSystem } from './utils/file-system';

// Types
export * from './types/index';
