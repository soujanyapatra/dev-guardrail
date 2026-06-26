import chalk from 'chalk';

/**
 * Logger utility for consistent output formatting
 */
export class Logger {
  private verbose: boolean;

  constructor(verbose = false) {
    this.verbose = verbose;
  }

  info(message: string): void {
    console.log(chalk.blue('ℹ'), message);
  }

  success(message: string): void {
    console.log(chalk.green('✓'), message);
  }

  warning(message: string): void {
    console.log(chalk.yellow('⚠'), message);
  }

  error(message: string): void {
    console.error(chalk.red('✗'), message);
  }

  debug(message: string): void {
    if (this.verbose) {
      console.log(chalk.gray('→'), message);
    }
  }

  heading(message: string): void {
    console.log('\n' + chalk.bold.cyan(message));
  }

  divider(): void {
    console.log(chalk.gray('─'.repeat(50)));
  }

  table(data: Array<Record<string, string | number>>): void {
    if (data.length === 0) return;
    
    const headers = Object.keys(data[0]);
    const widths = headers.map((h) =>
      Math.max(h.length, ...data.map((row) => String(row[h]).length))
    );

    // Header
    console.log(
      headers.map((h, i) => chalk.bold(h.padEnd(widths[i]))).join('  ')
    );
    console.log(widths.map((w) => '─'.repeat(w)).join('  '));

    // Rows
    data.forEach((row) => {
      console.log(
        headers.map((h, i) => String(row[h]).padEnd(widths[i])).join('  ')
      );
    });
  }

  progress(current: number, total: number, message: string): void {
    const percentage = Math.floor((current / total) * 100);
    const bars = Math.floor(percentage / 5);
    const bar = '█'.repeat(bars) + '░'.repeat(20 - bars);
    process.stdout.write(`\r${chalk.cyan(bar)} ${percentage}% ${message}`);
    
    if (current === total) {
      process.stdout.write('\n');
    }
  }

  clear(): void {
    process.stdout.write('\x1Bc');
  }
}

export const logger = new Logger();
