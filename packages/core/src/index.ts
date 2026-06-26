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

// Utilities
export { Logger } from './utils/logger';
export { FileSystem } from './utils/file-system';

// Types
export * from './types/index';
