#!/usr/bin/env node

import { Command } from 'commander';
import { DevGuard } from './devguard';
import { Logger } from './utils/logger';

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
      
      // Display results with beautiful UI
      logger.overallScore(result.overallScore, result.grade);
      
      // Get category scores
      const categoryScores = await devguard.getCategoryScores(result);
      logger.categoryBreakdown(categoryScores);
      
      // Show detailed issues
      logger.divider();
      logger.heading('Issues Found');
      
      if (result.summary.totalIssues === 0) {
        logger.success('No issues found! 🎉');
      } else {
        // Group issues by severity
        const errors = result.checkResults.flatMap(r => r.issues.filter(i => i.severity === 'error'));
        const warnings = result.checkResults.flatMap(r => r.issues.filter(i => i.severity === 'warning'));
        const info = result.checkResults.flatMap(r => r.issues.filter(i => i.severity === 'info'));
        
        if (errors.length > 0) {
          logger.error(`\n${errors.length} Errors:`);
          errors.slice(0, 10).forEach(issue => logger.issueDetail(issue));
          if (errors.length > 10) {
            logger.info(`... and ${errors.length - 10} more errors`);
          }
        }
        
        if (warnings.length > 0) {
          logger.warning(`\n${warnings.length} Warnings:`);
          warnings.slice(0, 10).forEach(issue => logger.issueDetail(issue));
          if (warnings.length > 10) {
            logger.info(`... and ${warnings.length - 10} more warnings`);
          }
        }
        
        if (options.verbose && info.length > 0) {
          logger.info(`\n${info.length} Info:`);
          info.slice(0, 5).forEach(issue => logger.issueDetail(issue));
        }
      }
      
      // Summary
      logger.divider();
      logger.info(`Files Scanned: ${result.summary.filesScanned}`);
      logger.info(`Duration: ${(result.summary.duration / 1000).toFixed(2)}s`);
      logger.divider();
      
      logger.info('\nFor full report: npx devguard report --format html');
      
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
      
      // Display overall score
      logger.overallScore(result.overallScore, result.grade);
      
      // Display category breakdown
      const categoryScores = await devguard.getCategoryScores(result);
      logger.categoryBreakdown(categoryScores);
      
      // Summary
      logger.divider();
      console.log(`  Files Scanned: ${result.summary.filesScanned}`);
      console.log(`  Total Issues: ${result.summary.totalIssues}`);
      logger.divider();
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
