/**
 * Filter Configuration
 * Defines filters that can be applied to table data
 */
export interface FilterConfig {
  id: string;
  label: string;
  type: "text" | "select" | "multi-select" | "date" | "date-range" | "boolean";
  column: string;
  placeholder?: string;
  options?: Array<{ label: string; value: string }>;
  /** Labels for boolean/ternary filters (defaults: "Ja"/"Nein"). */
  trueLabel?: string;
  falseLabel?: string;
}

/**
 * Search Configuration
 * Defines search functionality for the table
 */
export interface SearchConfig {
  enabled: boolean;
  placeholder?: string;
  columns?: string[]; // Which columns to search
  debounce?: number;
}

