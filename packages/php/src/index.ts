import { Plugin } from '@devguard/core';
import { PHPDebugCheck } from './checks/php-debug-check.js';
import { PHPSyntaxCheck } from './checks/php-syntax-check.js';
import { PHPLongMethodCheck } from './checks/php-long-method-check.js';
import { PHPTodoCheck } from './checks/php-todo-check.js';

/**
 * PHP plugin for DevGuard
 * Supports: Laravel, Symfony, WordPress, Drupal, and pure PHP projects
 */
export const plugin: Plugin = {
  name: '@devguard/php',
  version: '0.1.0',
  description: 'PHP quality and security checks for Laravel, Symfony, WordPress, and more',
  checks: [
    new PHPDebugCheck(),
    new PHPSyntaxCheck(),
    new PHPLongMethodCheck(),
    // PHPTodoCheck is optional - can be added via config
  ],
  scoreWeight: 0.3,
};

export default plugin;

// Export individual checks for custom usage
export { PHPDebugCheck } from './checks/php-debug-check.js';
export { PHPSyntaxCheck } from './checks/php-syntax-check.js';
export { PHPLongMethodCheck } from './checks/php-long-method-check.js';
export { PHPTodoCheck } from './checks/php-todo-check.js';
