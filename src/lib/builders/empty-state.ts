import { EmptyStateConfig } from "../types/empty-state";
import React from "react";

/**
 * Empty State Builder
 * Fluent API for building empty state configurations
 */
export class EmptyStateBuilder {
  private config: EmptyStateConfig = {
    title: "No data",
    variant: "default",
  };

  static make(): EmptyStateBuilder {
    return new EmptyStateBuilder();
  }

  title(title: string): this {
    this.config.title = title;
    return this;
  }

  description(description: string): this {
    this.config.description = description;
    return this;
  }

  icon(icon: React.ReactNode): this {
    this.config.icon = icon;
    return this;
  }

  imageUrl(imageUrl: string): this {
    this.config.imageUrl = imageUrl;
    return this;
  }

  action(
    label: string,
    onClick?: () => void,
    href?: string,
    icon?: React.ReactNode,
  ): this {
    this.config.action = { label, onClick, href, icon };
    return this;
  }

  variant(variant: "default" | "search" | "filter" | "error" | "custom"): this {
    this.config.variant = variant;
    return this;
  }

  error(params: { onRetry?: () => void } = {}): this {
    this.config.variant = "error";
    this.config.title = "Error";
    this.config.description = "Something went wrong. Please try again.";
    if (params.onRetry) {
      this.config.action = { label: "Retry", onClick: params.onRetry };
    }
    return this;
  }

  noSearchResults(params: { onClear?: () => void } = {}): this {
    this.config.variant = "search";
    this.config.title = "No results found";
    this.config.description = "Try adjusting your search terms.";
    if (params.onClear) {
      this.config.action = { label: "Clear search", onClick: params.onClear };
    }
    return this;
  }

  noFilterResults(params: { onReset?: () => void } = {}): this {
    this.config.variant = "filter";
    this.config.title = "No results match your filters";
    this.config.description = "Try adjusting or clearing your filters.";
    if (params.onReset) {
      this.config.action = { label: "Reset filters", onClick: params.onReset };
    }
    return this;
  }

  noData(): this {
    this.config.variant = "default";
    this.config.title = "No data";
    this.config.description = "There is no data to display.";
    return this;
  }

  build(): EmptyStateConfig {
    return this.config;
  }
}

