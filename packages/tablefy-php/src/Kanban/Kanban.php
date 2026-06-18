<?php

namespace Nccirtu\Tablefy\Kanban;

/**
 * Kanban configuration for a resource list. Declares which field decides the
 * column (groupBy), optional reordering, and — for the dynamic case — the
 * column list itself. Static enum columns are usually declared in the frontend
 * card schema instead (Hybrid model).
 */
class Kanban
{
    protected string $groupByField = '';

    protected ?string $sortColumn = null;

    protected bool $columnsMovable = true;

    protected int $perColumn = 15;

    /** Normalized columns: list of ['id'=>, 'label'=>, 'color'=>]. Empty = frontend owns them. */
    protected array $columns = [];

    /** Allowed move targets (column ids). Null = derive from columns / no restriction. */
    protected ?array $allowed = null;

    /** 'plain' | 'pipeline' (chevron flow + flat terminal headers). */
    protected string $headerStyle = 'plain';

    /** Cards may enter `terminal` columns but not leave them. */
    protected bool $lockTerminal = true;

    /** Per-from allowed transitions: ['new' => ['documents','cancelled'], …]. Null = unrestricted. */
    protected ?array $transitions = null;

    /** Stage handlers (class-string<KanbanAction> | callable). */
    protected array $onEnter = [];

    protected array $onLeave = [];

    protected array $onTransition = [];

    public static function make(): static
    {
        return new static();
    }

    public function groupBy(string $field): static
    {
        $this->groupByField = $field;

        return $this;
    }

    /** Enable card reordering; persists the order in $column (default "position"). */
    public function sortable(string $column = 'position'): static
    {
        $this->sortColumn = $column;

        return $this;
    }

    public function columnsMovable(bool $movable = true): static
    {
        $this->columnsMovable = $movable;

        return $this;
    }

    public function perColumn(int $perColumn): static
    {
        $this->perColumn = $perColumn;

        return $this;
    }

    /**
     * Declare columns explicitly (Variant B). Accepts:
     *   ['pending' => ['label' => 'Offen', 'color' => 'amber'], ...]
     *   ['pending', 'active', ...]
     */
    public function columns(array $columns): static
    {
        $normalized = [];
        foreach ($columns as $key => $value) {
            if (is_int($key)) {
                $normalized[] = ['id' => (string) $value, 'label' => (string) $value];
            } else {
                $normalized[] = [
                    'id' => (string) $key,
                    'label' => $value['label'] ?? (string) $key,
                    'color' => $value['color'] ?? null,
                    'kind' => $value['kind'] ?? 'flow',
                ];
            }
        }
        $this->columns = $normalized;

        return $this;
    }

    /**
     * Build columns from a collection/array of rows (dynamic, DB-managed).
     *
     * @param  iterable<mixed>  $rows
     */
    public function columnsFrom(iterable $rows, string $label = 'name', string $color = 'color', string $id = 'id', string $kind = 'kind'): static
    {
        $normalized = [];
        foreach ($rows as $row) {
            $get = static fn (string $key) => is_array($row) ? ($row[$key] ?? null) : ($row->{$key} ?? null);
            $normalized[] = [
                'id' => (string) $get($id),
                'label' => (string) ($get($label) ?? $get($id)),
                'color' => $get($color),
                'kind' => $get($kind) ?? 'flow',
            ];
        }
        $this->columns = $normalized;

        return $this;
    }

    /** Restrict the columns a card may be moved to. */
    public function allowed(array $ids): static
    {
        $this->allowed = array_map('strval', $ids);

        return $this;
    }

    /** Chevron pipeline headers (flow) + flat terminal headers. */
    public function pipeline(bool $enabled = true): static
    {
        $this->headerStyle = $enabled ? 'pipeline' : 'plain';

        return $this;
    }

    public function lockTerminal(bool $lock = true): static
    {
        $this->lockTerminal = $lock;

        return $this;
    }

    /**
     * Allowed transitions per source column: ['new' => ['documents','cancelled'], …].
     * A move to a column not listed for its source is rejected (422).
     */
    public function allowTransitions(array $map): static
    {
        $this->transitions = array_map(
            fn ($targets) => array_map('strval', (array) $targets),
            $map,
        );

        return $this;
    }

    /** Run when a card ENTERS $column. $handler = class-string<KanbanAction>|callable. */
    public function onEnter(string $column, string|callable $handler): static
    {
        $this->onEnter[$column][] = $handler;

        return $this;
    }

    /** Run when a card LEAVES $column. */
    public function onLeave(string $column, string|callable $handler): static
    {
        $this->onLeave[$column][] = $handler;

        return $this;
    }

    /** Run on EVERY move. */
    public function onTransition(string|callable $handler): static
    {
        $this->onTransition[] = $handler;

        return $this;
    }

    // --- Accessors used by the controller ---

    public function getGroupBy(): string
    {
        return $this->groupByField;
    }

    public function getSortColumn(): ?string
    {
        return $this->sortColumn;
    }

    public function getPerColumn(): int
    {
        return $this->perColumn;
    }

    /** Column ids if known (explicit/dynamic), else null. */
    public function columnIds(): ?array
    {
        return $this->columns === [] ? null : array_column($this->columns, 'id');
    }

    /** Allowed move targets, or null when unrestricted. */
    public function allowedColumns(): ?array
    {
        return $this->allowed ?? $this->columnIds();
    }

    public function locksTerminal(): bool
    {
        return $this->lockTerminal;
    }

    /** Column ids whose kind is `terminal`. */
    public function terminalColumns(): array
    {
        return array_values(array_map(
            fn ($c) => $c['id'],
            array_filter($this->columns, fn ($c) => ($c['kind'] ?? 'flow') === 'terminal'),
        ));
    }

    /** Allowed target columns for $from, or null when unrestricted. */
    public function transitionsFor(string $from): ?array
    {
        if ($this->transitions === null) {
            return null;
        }

        return $this->transitions[$from] ?? [];
    }

    /** @return array<int, string|callable> */
    public function enterHandlers(string $column): array
    {
        return $this->onEnter[$column] ?? [];
    }

    /** @return array<int, string|callable> */
    public function leaveHandlers(?string $column): array
    {
        return $column === null ? [] : ($this->onLeave[$column] ?? []);
    }

    /** @return array<int, string|callable> */
    public function transitionHandlers(): array
    {
        return $this->onTransition;
    }

    /** The `kanban` page prop the frontend reads. */
    public function toArray(string $routeName): array
    {
        return [
            'enabled' => true,
            'groupBy' => $this->groupByField,
            'sortable' => $this->sortColumn !== null,
            'columnsMovable' => $this->columnsMovable,
            'perColumn' => $this->perColumn,
            'headerStyle' => $this->headerStyle,
            'lockTerminal' => $this->lockTerminal,
            'columns' => $this->columns, // [] → frontend card schema owns columns
            'moveUrl' => route("{$routeName}.kanban.move", absolute: false),
        ];
    }
}
