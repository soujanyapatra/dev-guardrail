#!/usr/bin/env node

import { Command } from 'commander';
import { DevGuard } from './devguard.js';
import { Logger } from './utils/logger.js';
import { FileSystem } from './utils/file-system.js';

const logger = new Logger();
const program = new Command();

program
  .name('devguard')
  .description('Production-grade engineering quality platform')
  .version('0.1.0');

/**
 * Initialize DevGuard in project
 */
program
  .command('init')
  .description('Initialize DevGuard in your project')
  .option('-f, --force', 'Overwrite existing configuration')
  .action(async (options) => {
    try {
      const projectPath = process.cwd();
      const devguard = new DevGuard(projectPath);
      
      logger.heading('Initializing DevGuard');
      await devguard.init(options.force);
      
      logger.success('DevGuard initialized successfully!');
      logger.info('Configuration file created: .devguard/config.yaml');
      logger.info('Run "devguard check" to start scanning');
    } catch (error) {
      logger.error(`Initialization failed: ${(error as Error).message}`);
      process.exit(1);
    }
  });

/**
 * Run quality checks
 */
program
  .command('check')
  .description('Run all quality checks')
  .option('-v, --verbose', 'Enable verbose output')
  .option('--ci', 'Run in CI mode (exit with error code if quality is below threshold)')
  .action(async (options) => {
    try {
      const projectPath = process.cwd();
      const devguard = new DevGuard(projectPath, new Logger(options.verbose));
      
      const result = await devguard.check();
      
      // Display results
      logger.divider();
      logger.heading(`Overall Score: ${result.overallScore}% (Grade ${result.grade})`);
      logger.info(`Files Scanned: ${result.summary.filesScanned}`);
      logger.info(`Issues Found: ${result.summary.totalIssues}`);
      logger.error(`  Errors: ${result.summary.errors}`);
      logger.warning(`  Warnings: ${result.summary.warnings}`);
      logger.info(`  Info: ${result.summary.info}`);
      logger.info(`Duration: ${result.summary.duration}ms`);
      logger.divider();
      
      if (options.ci) {
        const config = await devguard.getConfig();
        if (result.overallScore < config.quality.minimumScore) {
          logger.error(`Quality score ${result.overallScore}% is below minimum ${config.quality.minimumScore}%`);
          process.exit(1);
        }
      }
    } catch (error) {
      logger.error(`Check failed: ${(error as Error).message}`);
      process.exit(1);
    }
  });

/**
 * Show current score
 */
program
  .command('score')
  .description('Display current quality score')
  .action(async () => {
    try {
      const projectPath = process.cwd();
      const devguard = new DevGuard(projectPath);
      
      const result = await devguard.check();
      
      logger.clear();
      logger.heading('DevGuard Quality Score');
      logger.divider();
      console.log(`
  Overall Score: ${result.overallScore}%
  Grade: ${result.grade}
  
  Files Scanned: ${result.summary.filesScanned}
  Total Issues: ${result.summary.totalIssues}
      `);
    } catch (error) {
      logger.error(`Score calculation failed: ${(error as Error).message}`);
      process.exit(1);
    }
  });

/**
 * Generate report
 */
program
  .command('report')
  .description('Generate detailed quality report')
  .option('-f, --format <format>', 'Report format (json, html, markdown)', 'json')
  .option('-o, --output <path>', 'Output file path')
  .action(async (options) => {
    try {
      const projectPath = process.cwd();
      const devguard = new DevGuard(projectPath);
      
      logger.info('Generating report...');
      await devguard.report(options.format, options.output);
      
      logger.success(`Report generated: ${options.output || 'reports/'}`);
    } catch (error) {
      logger.error(`Report generation failed: ${(error as Error).message}`);
      process.exit(1);
    }
  });

/**
 * Diagnose setup issues
 */
program
  .command('doctor')
  .description('Diagnose DevGuard setup issues')
  .action(async () => {
    try {
      const projectPath = process.cwd();
      const devguard = new DevGuard(projectPath);
      
      logger.heading('DevGuard Doctor');
      await devguard.doctor();
    } catch (error) {
      logger.error(`Doctor check failed: ${(error as Error).message}`);
      process.exit(1);
    }
  });

/**
 * Install Git hooks
 */
program
  .command('hooks')
  .description('Install Git hooks')
  .option('--uninstall', 'Uninstall Git hooks')
  .action(async (options) => {
    try {
      const projectPath = process.cwd();
      const devguard = new DevGuard(projectPath);
      
      if (options.uninstall) {
        await devguard.uninstallHooks();
        logger.success('Git hooks uninstalled');
      } else {
        await devguard.installHooks();
        logger.success('Git hooks installed');
      }
    } catch (error) {
      logger.error(`Hook installation failed: ${(error as Error).message}`);
      process.exit(1);
    }
  });

/**
 * Plugin management
 */
const pluginsCmd = program
  .command('plugins')
  .description('Manage DevGuard plugins');

pluginsCmd
  .command('list')
  .description('List installed plugins')
  .action(async () => {
    try {
      const projectPath = process.cwd();
      const devguard = new DevGuard(projectPath);
      
      const plugins = await devguard.listPlugins();
      
      if (plugins.length === 0) {
        logger.info('No plugins installed');
        return;
      }
      
      logger.heading('Installed Plugins');
      plugins.forEach((p) => {
        logger.info(`${p.name} v${p.version} - ${p.checks} checks`);
      });
    } catch (error) {
      logger.error(`Failed to list plugins: ${(error as Error).message}`);
      process.exit(1);
    }
  });

program.parse();
