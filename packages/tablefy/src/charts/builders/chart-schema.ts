import {
  ChartBuildResult,
  ChartConfigMap,
  ChartOptions,
  ChartSchemaConfig,
  ChartType,
} from "../types";

/**
 * Optional client-side overrides for a backend chart (the `--component` schema).
 * Anything set here wins over the backend payload when rendered by
 * `<TablefyChart>`.
 */
export class ChartSchema {
  private cfg: ChartSchemaConfig = {};

  static make(): ChartSchema {
    return new ChartSchema();
  }

  type(type: ChartType): this {
    this.cfg.type = type;
    return this;
  }

  xKey(key: string): this {
    this.cfg.xKey = key;
    return this;
  }

  series(keys: string[]): this {
    this.cfg.series = keys;
    return this;
  }

  config(config: ChartConfigMap): this {
    this.cfg.config = config;
    return this;
  }

  options(options: ChartOptions): this {
    this.cfg.options = { ...this.cfg.options, ...options };
    return this;
  }

  heading(heading: string): this {
    this.cfg.heading = heading;
    return this;
  }

  description(description: string): this {
    this.cfg.description = description;
    return this;
  }

  className(className: string): this {
    this.cfg.className = className;
    return this;
  }

  build(): ChartBuildResult {
    return { config: { ...this.cfg } };
  }
}
