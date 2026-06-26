import { FileSystem } from '../utils/file-system';
import { ProjectInfo } from '../types/index';

/**
 * Detects project type, languages, and frameworks
 */
export class ProjectDetector {
  private projectPath: string;

  constructor(projectPath: string) {
    this.projectPath = projectPath;
  }

  /**
   * Detect all project information
   */
  async detect(): Promise<ProjectInfo> {
    const [
      types,
      packageManager,
      language,
      frameworks,
      hasTests,
      hasDocker,
      hasCI,
    ] = await Promise.all([
      this.detectTypes(),
      this.detectPackageManager(),
      this.detectLanguages(),
      this.detectFrameworks(),
      this.checkTests(),
      this.checkDocker(),
      this.checkCI(),
    ]);

    return {
      types,
      packageManager,
      language,
      frameworks,
      hasTests,
      hasDocker,
      hasCI,
    };
  }

  /**
   * Detect project types (frontend, backend, mobile, etc.)
   */
  private async detectTypes(): Promise<string[]> {
    const types: string[] = [];

    // Check for frontend indicators
    if (
      await this.hasAnyFile([
        'package.json',
        'index.html',
        'public/index.html',
        'src/App.tsx',
        'src/App.vue',
      ])
    ) {
      types.push('frontend');
    }

    // Check for backend indicators
    if (
      await this.hasAnyFile([
        'server.js',
        'app.js',
        'main.py',
        'index.php',
        'composer.json',
      ])
    ) {
      types.push('backend');
    }

    // Check for mobile indicators
    if (
      await this.hasAnyFile(['pubspec.yaml', 'android/', 'ios/', 'App.tsx'])
    ) {
      types.push('mobile');
    }

    return types;
  }

  /**
   * Detect package manager
   */
  private async detectPackageManager(): Promise<ProjectInfo['packageManager']> {
    if (await FileSystem.exists(`${this.projectPath}/pnpm-lock.yaml`))
      return 'pnpm';
    if (await FileSystem.exists(`${this.projectPath}/yarn.lock`))
      return 'yarn';
    if (await FileSystem.exists(`${this.projectPath}/package-lock.json`))
      return 'npm';
    if (await FileSystem.exists(`${this.projectPath}/requirements.txt`))
      return 'pip';
    if (await FileSystem.exists(`${this.projectPath}/composer.json`))
      return 'composer';
    if (await FileSystem.exists(`${this.projectPath}/pubspec.yaml`))
      return 'pub';

    return 'unknown';
  }

  /**
   * Detect programming languages
   */
  private async detectLanguages(): Promise<string[]> {
    const languages: string[] = [];

    const files = await FileSystem.findFiles(['**/*'], {
      cwd: this.projectPath,
      ignore: ['**/node_modules/**', '**/vendor/**', '**/dist/**'],
    });

    const extensions = new Set(
      files.map((f) => {
        const match = f.match(/\.([^.]+)$/);
        return match ? match[1] : '';
      })
    );

    if (extensions.has('ts') || extensions.has('tsx')) languages.push('typescript');
    if (extensions.has('js') || extensions.has('jsx')) languages.push('javascript');
    if (extensions.has('py')) languages.push('python');
    if (extensions.has('php')) languages.push('php');
    if (extensions.has('dart')) languages.push('dart');
    if (extensions.has('go')) languages.push('go');
    if (extensions.has('rs')) languages.push('rust');
    if (extensions.has('java')) languages.push('java');
    if (extensions.has('cs')) languages.push('csharp');

    return languages;
  }

  /**
   * Detect frameworks
   */
  private async detectFrameworks(): Promise<string[]> {
    const frameworks: string[] = [];

    // JavaScript/TypeScript frameworks
    const packageJsonPath = `${this.projectPath}/package.json`;
    if (await FileSystem.exists(packageJsonPath)) {
      const packageJson = await FileSystem.readJSON<{
        dependencies?: Record<string, string>;
        devDependencies?: Record<string, string>;
      }>(packageJsonPath);

      const allDeps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
      };

      if (allDeps.react) frameworks.push('react');
      if (allDeps.vue) frameworks.push('vue');
      if (allDeps.next) frameworks.push('nextjs');
      if (allDeps.nuxt) frameworks.push('nuxt');
      if (allDeps['@angular/core']) frameworks.push('angular');
      if (allDeps.express) frameworks.push('express');
      if (allDeps['@nestjs/core']) frameworks.push('nestjs');
      if (allDeps['react-native']) frameworks.push('react-native');
    }

    // PHP frameworks
    const composerPath = `${this.projectPath}/composer.json`;
    if (await FileSystem.exists(composerPath)) {
      const composer = await FileSystem.readJSON<{
        require?: Record<string, string>;
      }>(composerPath);

      if (composer.require?.['laravel/framework']) frameworks.push('laravel');
    }

    // Python frameworks
    const requirementsPath = `${this.projectPath}/requirements.txt`;
    if (await FileSystem.exists(requirementsPath)) {
      const requirements = await FileSystem.readFile(requirementsPath);

      if (requirements.includes('django')) frameworks.push('django');
      if (requirements.includes('fastapi')) frameworks.push('fastapi');
      if (requirements.includes('flask')) frameworks.push('flask');
    }

    // Flutter
    if (await FileSystem.exists(`${this.projectPath}/pubspec.yaml`)) {
      frameworks.push('flutter');
    }

    return frameworks;
  }

  /**
   * Check if project has tests
   */
  private async checkTests(): Promise<boolean> {
    return this.hasAnyFile([
      '**/*.test.ts',
      '**/*.test.js',
      '**/*.spec.ts',
      '**/*.spec.js',
      'tests/**',
      '__tests__/**',
      'test/**',
    ]);
  }

  /**
   * Check if project has Docker
   */
  private async checkDocker(): Promise<boolean> {
    return this.hasAnyFile(['Dockerfile', 'docker-compose.yml']);
  }

  /**
   * Check if project has CI configuration
   */
  private async checkCI(): Promise<boolean> {
    return this.hasAnyFile([
      '.github/workflows/**',
      '.gitlab-ci.yml',
      'bitbucket-pipelines.yml',
      'azure-pipelines.yml',
      'Jenkinsfile',
    ]);
  }

  /**
   * Check if any of the files exist
   */
  private async hasAnyFile(patterns: string[]): Promise<boolean> {
    for (const pattern of patterns) {
      const fullPath = FileSystem.join(this.projectPath, pattern);
      if (await FileSystem.exists(fullPath)) {
        return true;
      }

      // Try glob pattern
      const matches = await FileSystem.findFiles([pattern], {
        cwd: this.projectPath,
        ignore: ['**/node_modules/**', '**/vendor/**'],
      });

      if (matches.length > 0) {
        return true;
      }
    }

    return false;
  }
}
