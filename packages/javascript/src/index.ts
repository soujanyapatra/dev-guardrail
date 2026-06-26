import { Plugin } from '@devguard/core';
import { ESLintCheck } from './checks/eslint-check.js';
import { TypeScriptCheck } from './checks/typescript-check.js';

/**
 * JavaScript/TypeScript plugin for DevGuard
 */
export const plugin: Plugin = {
  name: '@devguard/javascript',
  version: '0.1.0',
  description: 'JavaScript and TypeScript quality checks',
  checks: [
    new ESLintCheck(),
    new TypeScriptCheck(),
  ],
  scoreWeight: 0.3,
};

export default plugin;
