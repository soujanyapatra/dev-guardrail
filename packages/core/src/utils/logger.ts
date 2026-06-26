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

  /**
   * Display a category score with progress bar
   */
  categoryScore(category: string, score: number): void {
    const maxBars = 20;
    const bars = Math.floor((score / 100) * maxBars);
    const filledBar = '█'.repeat(bars);
    const emptyBar = '░'.repeat(maxBars - bars);
    
    // Color based on score
    let barColor = chalk.green;
    if (score < 70) barColor = chalk.red;
    else if (score < 85) barColor = chalk.yellow;
    
    const paddedCategory = category.padEnd(15);
    const paddedScore = `${score}%`.padStart(4);
    
    console.log(`${paddedCategory} ${paddedScore} ${barColor(filledBar)}${chalk.gray(emptyBar)}`);
  }

  /**
   * Display overall score with grade
   */
  overallScore(score: number, grade: string): void {
    console.log('\n' + chalk.bold.cyan('─'.repeat(50)));
    
    // Large score display
    const scoreColor = score >= 90 ? chalk.green : score >= 80 ? chalk.yellow : score >= 70 ? chalk.yellow : chalk.red;
    console.log(chalk.bold(`\n  Overall Score: ${scoreColor(score + '%')} (Grade ${scoreColor(grade)})\n`));
    
    console.log(chalk.bold.cyan('─'.repeat(50)));
  }

  /**
   * Display category breakdown
   */
  categoryBreakdown(categories: Record<string, number>): void {
    console.log('\n' + chalk.bold('Quality Breakdown:\n'));
    
    for (const [category, score] of Object.entries(categories)) {
      this.categoryScore(category, score);
    }
    
    console.log('');
  }
}

export const logger = new Logger();
