/**
 * DevGuard Core
 * Production-grade engineering quality platform
 */

export { DevGuard } from './devguard.js';
export { ConfigManager } from './config/config-manager.js';
export { PluginManager } from './plugin/plugin-manager.js';
export { Scanner } from './scanner/scanner.js';
export { ProjectDetector } from './detector/project-detector.js';
export { ScoringEngine } from './scoring/scoring-engine.js';

// Checks
export { BaseCheck } from './checks/base-check.js';
export { ConsoleLogCheck } from './checks/console-log-check.js';
export { LargeFileCheck } from './checks/large-file-check.js';
export { TodoCheck } from './checks/todo-check.js';

// Utilities
export { Logger } from './utils/logger.js';
export { FileSystem } from './utils/file-system.js';

// Types
export * from './types/index.js';
