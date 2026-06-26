import { promises as fs } from 'fs';
import { join, relative } from 'path';
import { glob } from 'glob';

/**
 * File system utilities
 */
export class FileSystem {
  /**
   * Check if a file exists
   */
  static async exists(path: string): Promise<boolean> {
    try {
      await fs.access(path);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Read file content
   */
  static async readFile(path: string): Promise<string> {
    return fs.readFile(path, 'utf-8');
  }

  /**
   * Write file content
   */
  static async writeFile(path: string, content: string): Promise<void> {
    await fs.writeFile(path, content, 'utf-8');
  }

  /**
   * Read JSON file
   */
  static async readJSON<T = unknown>(path: string): Promise<T> {
    const content = await this.readFile(path);
    return JSON.parse(content) as T;
  }

  /**
   * Write JSON file
   */
  static async writeJSON(path: string, data: unknown): Promise<void> {
    const content = JSON.stringify(data, null, 2);
    await this.writeFile(path, content);
  }

  /**
   * Create directory recursively
   */
  static async mkdir(path: string): Promise<void> {
    await fs.mkdir(path, { recursive: true });
  }

  /**
   * Find files matching patterns
   */
  static async findFiles(
    patterns: string[],
    options: {
      cwd?: string;
      ignore?: string[];
      absolute?: boolean;
    } = {}
  ): Promise<string[]> {
    const { cwd = process.cwd(), ignore = [], absolute = false } = options;

    const files: string[] = [];
    for (const pattern of patterns) {
      const matches = await glob(pattern, {
        cwd,
        ignore,
        absolute,
        nodir: true,
      });
      files.push(...matches);
    }

    return [...new Set(files)]; // Remove duplicates
  }

  /**
   * Get relative path from project root
   */
  static getRelativePath(from: string, to: string): string {
    return relative(from, to);
  }

  /**
   * Get file size in bytes
   */
  static async getFileSize(path: string): Promise<number> {
    const stats = await fs.stat(path);
    return stats.size;
  }

  /**
   * Get file stats
   */
  static async getStats(path: string): Promise<{
    size: number;
    lines: number;
    isDirectory: boolean;
  }> {
    const stats = await fs.stat(path);
    
    if (stats.isDirectory()) {
      return {
        size: 0,
        lines: 0,
        isDirectory: true,
      };
    }

    const content = await this.readFile(path);
    const lines = content.split('\n').length;

    return {
      size: stats.size,
      lines,
      isDirectory: false,
    };
  }

  /**
   * Copy file
   */
  static async copy(source: string, destination: string): Promise<void> {
    await fs.copyFile(source, destination);
  }

  /**
   * Delete file
   */
  static async delete(path: string): Promise<void> {
    await fs.unlink(path);
  }

  /**
   * List directory contents
   */
  static async readdir(path: string): Promise<string[]> {
    return fs.readdir(path);
  }

  /**
   * Join paths
   */
  static join(...paths: string[]): string {
    return join(...paths);
  }
}
