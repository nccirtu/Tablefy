import { FilterConfig } from "../types/filters";

type FilterType = FilterConfig["type"];

/**
 * Fluent filter builders: `SelectFilter.make("status").options(...)`.
 * They produce a {@link FilterConfig} consumed by the table's filter UI.
 */
abstract class BaseFilter {
  protected config: FilterConfig;

  constructor(column: string, type: FilterType) {
    this.config = { id: column, column, label: column, type };
  }

  label(label: string): this {
    this.config.label = label;
    return this;
  }

  placeholder(placeholder: string): this {
    this.config.placeholder = placeholder;
    return this;
  }

  build(): FilterConfig {
    return this.config;
  }
}

export class SelectFilter extends BaseFilter {
  static make(column: string): SelectFilter {
    return new SelectFilter(column, "select");
  }

  options(options: Array<{ label: string; value: string }>): this {
    this.config.options = options;
    return this;
  }

  /** Allow selecting multiple values (renders as checkboxes, applies `whereIn`). */
  multiple(multiple = true): this {
    this.config.type = multiple ? "multi-select" : "select";
    return this;
  }
}

export class TernaryFilter extends BaseFilter {
  static make(column: string): TernaryFilter {
    return new TernaryFilter(column, "boolean");
  }

  labels(trueLabel: string, falseLabel: string): this {
    this.config.trueLabel = trueLabel;
    this.config.falseLabel = falseLabel;
    return this;
  }
}

export class TextFilter extends BaseFilter {
  static make(column: string): TextFilter {
    return new TextFilter(column, "text");
  }
}

export class DateFilter extends BaseFilter {
  static make(column: string): DateFilter {
    return new DateFilter(column, "date");
  }

  /** Render a from/to range (applies a `whereBetween`). */
  range(range = true): this {
    this.config.type = range ? "date-range" : "date";
    return this;
  }
}
