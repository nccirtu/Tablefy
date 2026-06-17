<?php

namespace Nccirtu\Tablefy\Stats;

use Illuminate\Http\Request;

/**
 * A group of stats rendered as one grid. Subclasses implement stats() and are
 * referenced from a controller's $listStats / $viewStats. Resolved per-request
 * (and deferred) so the numbers are always live and the page shell stays fast.
 */
abstract class StatGroup
{
    /** Optional heading shown above the grid. */
    protected ?string $heading = null;

    /** Columns at the largest breakpoint. */
    protected int $columns = 4;

    /**
     * The stats in this group.
     *
     * @return array<int, Stat>
     */
    abstract public function stats(Request $request): array;

    public function heading(): ?string
    {
        return $this->heading;
    }

    public function columns(): int
    {
        return $this->columns;
    }

    /**
     * Serialize to the `StatGroupData` shape the frontend renders.
     *
     * @return array<string, mixed>
     */
    public function resolve(Request $request): array
    {
        return [
            'heading' => $this->heading(),
            'columns' => $this->columns(),
            'stats' => array_map(
                fn (Stat $stat) => $stat->toArray(),
                array_values($this->stats($request)),
            ),
        ];
    }
}
