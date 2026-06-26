import { Plugin, PluginContext, Check } from '../types/index.js';
import { Logger } from '../utils/logger.js';

/**
 * Manages plugins and their lifecycle
 */
export class PluginManager {
  private plugins: Map<string, Plugin> = new Map();
  private logger: Logger;
  private context: PluginContext;

  constructor(context: PluginContext, logger: Logger = new Logger()) {
    this.context = context;
    this.logger = logger;
  }

  /**
   * Register a plugin
   */
  async register(plugin: Plugin): Promise<void> {
    if (this.plugins.has(plugin.name)) {
      this.logger.warning(`Plugin ${plugin.name} is already registered`);
      return;
    }

    this.logger.debug(`Registering plugin: ${plugin.name}`);

    // Initialize plugin if it has an initialize method
    if (plugin.initialize) {
      await plugin.initialize(this.context);
    }

    this.plugins.set(plugin.name, plugin);
    this.logger.success(`Plugin registered: ${plugin.name} v${plugin.version}`);
  }

  /**
   * Unregister a plugin
   */
  async unregister(pluginName: string): Promise<void> {
    const plugin = this.plugins.get(pluginName);
    if (!plugin) {
      this.logger.warning(`Plugin ${pluginName} is not registered`);
      return;
    }

    // Cleanup plugin if it has a cleanup method
    if (plugin.cleanup) {
      await plugin.cleanup();
    }

    this.plugins.delete(pluginName);
    this.logger.success(`Plugin unregistered: ${pluginName}`);
  }

  /**
   * Get all registered plugins
   */
  getPlugins(): Plugin[] {
    return Array.from(this.plugins.values());
  }

  /**
   * Get plugin by name
   */
  getPlugin(name: string): Plugin | undefined {
    return this.plugins.get(name);
  }

  /**
   * Get all checks from all plugins
   */
  getAllChecks(): Check[] {
    const checks: Check[] = [];
    for (const plugin of this.plugins.values()) {
      checks.push(...plugin.checks);
    }
    return checks;
  }

  /**
   * Get checks by category
   */
  getChecksByCategory(category: string): Check[] {
    return this.getAllChecks().filter((check) => check.category === category);
  }

  /**
   * Load plugins from configuration
   */
  async loadPlugins(pluginNames: string[]): Promise<void> {
    for (const pluginName of pluginNames) {
      try {
        // Dynamic import of plugin
        const pluginModule = await import(pluginName);
        const plugin = pluginModule.default || pluginModule;
        
        if (this.isValidPlugin(plugin)) {
          await this.register(plugin);
        } else {
          this.logger.error(`Invalid plugin: ${pluginName}`);
        }
      } catch (error) {
        this.logger.error(`Failed to load plugin ${pluginName}: ${(error as Error).message}`);
      }
    }
  }

  /**
   * Validate plugin structure
   */
  private isValidPlugin(plugin: unknown): plugin is Plugin {
    if (typeof plugin !== 'object' || plugin === null) {
      return false;
    }

    const p = plugin as Partial<Plugin>;
    return (
      typeof p.name === 'string' &&
      typeof p.version === 'string' &&
      Array.isArray(p.checks)
    );
  }

  /**
   * Get plugin statistics
   */
  getStatistics(): {
    totalPlugins: number;
    totalChecks: number;
    pluginList: Array<{ name: string; version: string; checks: number }>;
  } {
    const plugins = this.getPlugins();
    return {
      totalPlugins: plugins.length,
      totalChecks: this.getAllChecks().length,
      pluginList: plugins.map((p) => ({
        name: p.name,
        version: p.version,
        checks: p.checks.length,
      })),
    };
  }

  /**
   * Cleanup all plugins
   */
  async cleanup(): Promise<void> {
    const pluginNames = Array.from(this.plugins.keys());
    for (const name of pluginNames) {
      await this.unregister(name);
    }
  }
}
