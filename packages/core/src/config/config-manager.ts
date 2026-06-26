import { cosmiconfig } from 'cosmiconfig';
import yaml from 'js-yaml';
import { FileSystem } from '../utils/file-system';
import { DevGuardConfig, CheckConfig } from '../types/index';

/**
 * Default configuration
 */
const DEFAULT_CONFIG: DevGuardConfig = {
  quality: {
    minimumScore: 85,
    failOnError: true,
  },
  checks: {
    lint: { enabled: true },
    format: { enabled: true },
    security: { enabled: true },
    secretScan: { enabled: true },
    coverage: { enabled: true },
    deadCode: { enabled: true },
    duplicateCode: { enabled: true },
    complexity: { enabled: true },
    architecture: { enabled: true },
    dependencyAudit: { enabled: true },
    performance: { enabled: true },
    tests: { enabled: true },
    consoleLog: { enabled: true },
    todoCheck: { enabled: false },
    licenseCheck: { enabled: true },
    customRules: { enabled: true },
  },
  exclude: [
    '**/node_modules/**',
    '**/dist/**',
    '**/build/**',
    '**/coverage/**',
    '**/.git/**',
    '**/vendor/**',
  ],
  include: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
  plugins: [],
};

/**
 * Manages DevGuard configuration
 */
export class ConfigManager {
  private projectPath: string;
  private config: DevGuardConfig | null = null;

  constructor(projectPath: string) {
    this.projectPath = projectPath;
  }

  /**
   * Load configuration from file or use defaults
   */
  async load(): Promise<DevGuardConfig> {
    if (this.config) {
      return this.config;
    }

    // Try to load from file
    const explorer = cosmiconfig('devguard');
    const result = await explorer.search(this.projectPath);

    if (result && !result.isEmpty) {
      this.config = this.mergeWithDefaults(result.config as Partial<DevGuardConfig>);
    } else {
      this.config = DEFAULT_CONFIG;
    }

    return this.config;
  }

  /**
   * Save configuration to file
   */
  async save(config: DevGuardConfig): Promise<void> {
    const configPath = FileSystem.join(this.projectPath, '.devguard', 'config.yaml');
    const configDir = FileSystem.join(this.projectPath, '.devguard');

    // Create directory if it doesn't exist
    if (!(await FileSystem.exists(configDir))) {
      await FileSystem.mkdir(configDir);
    }

    // Write YAML file
    const yamlContent = yaml.dump(config, { indent: 2 });
    await FileSystem.writeFile(configPath, yamlContent);

    this.config = config;
  }

  /**
   * Generate default configuration file
   */
  async init(): Promise<void> {
    await this.save(DEFAULT_CONFIG);
  }

  /**
   * Update specific check configuration
   */
  async updateCheck(
    checkName: keyof DevGuardConfig['checks'],
    config: CheckConfig
  ): Promise<void> {
    const currentConfig = await this.load();
    currentConfig.checks[checkName] = config;
    await this.save(currentConfig);
  }

  /**
   * Check if a check is enabled
   */
  async isCheckEnabled(checkName: keyof DevGuardConfig['checks']): Promise<boolean> {
    const config = await this.load();
    return config.checks[checkName]?.enabled ?? true;
  }

  /**
   * Get current configuration
   */
  async get(): Promise<DevGuardConfig> {
    return this.load();
  }

  /**
   * Merge user config with defaults
   */
  private mergeWithDefaults(userConfig: Partial<DevGuardConfig>): DevGuardConfig {
    return {
      quality: {
        ...DEFAULT_CONFIG.quality,
        ...userConfig.quality,
      },
      checks: {
        ...DEFAULT_CONFIG.checks,
        ...userConfig.checks,
      },
      exclude: userConfig.exclude ?? DEFAULT_CONFIG.exclude,
      include: userConfig.include ?? DEFAULT_CONFIG.include,
      plugins: userConfig.plugins ?? DEFAULT_CONFIG.plugins,
    };
  }

  /**
   * Validate configuration
   */
  validate(config: DevGuardConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (config.quality.minimumScore < 0 || config.quality.minimumScore > 100) {
      errors.push('minimumScore must be between 0 and 100');
    }

    if (!Array.isArray(config.exclude)) {
      errors.push('exclude must be an array');
    }

    if (!Array.isArray(config.include)) {
      errors.push('include must be an array');
    }

    if (!Array.isArray(config.plugins)) {
      errors.push('plugins must be an array');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get config file path
   */
  getConfigPath(): string {
    return FileSystem.join(this.projectPath, '.devguard', 'config.yaml');
  }
}
