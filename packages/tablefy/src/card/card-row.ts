import { CardCell, CardRowConfig } from "./types";

/** A row of card cells (laid out side by side in a grid). */
export class CardRow {
  private config: CardRowConfig;

  constructor(cells: CardCell[]) {
    this.config = { cells };
  }

  static make(cells: CardCell[]): CardRow {
    return new CardRow(cells);
  }

  /** Override the grid column count for this row (default = number of cells). */
  columns(count: number): this {
    this.config.columns = count;
    return this;
  }

  build(): CardRowConfig {
    return { ...this.config };
  }
}
