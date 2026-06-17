import type { StatCardRenderer, StatsConfig } from "../types/stats";

/**
 * Presentation schema for a stats overview. The numbers come from the backend
 * (`Stat::make(...)`); this only controls layout and (optionally) custom card
 * rendering — same split as Tables (backend data, frontend schema).
 *
 *   export const CustomerStats = Stats.make().columns(4);
 */
export class Stats {
  private config: StatsConfig = {};

  static make(): Stats {
    return new Stats();
  }

  /** Columns at the largest breakpoint (default 4). */
  columns(count: number): this {
    this.config.columns = count;
    return this;
  }

  /** Override how every card renders. */
  renderCard(render: StatCardRenderer): this {
    this.config.renderCard = render;
    return this;
  }

  /** Override how a single stat (matched by `name`) renders. */
  renderStat(name: string, render: StatCardRenderer): this {
    this.config.renderers = { ...this.config.renderers, [name]: render };
    return this;
  }

  build(): StatsConfig {
    return this.config;
  }
}
