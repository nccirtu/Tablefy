<?php

namespace Nccirtu\Tablefy\Charts;

use Illuminate\Http\Request;

/**
 * A single chart card (Filament-style widget). Numbers are computed on the
 * backend, deferred to the page, and rendered by <TablefyCharts>/<TablefyChart>
 * (config-driven shadcn/recharts). Subclasses implement data() + config().
 */
abstract class ChartWidget
{
    /** area | bar | bar-multiple | line | radar | radial | pie */
    protected string $type = 'bar';

    protected ?string $heading = null;

    protected ?string $description = null;

    /** Category / x-axis key (cartesian) or name key (pie/radial). */
    protected string $xKey = 'label';

    /**
     * Value keys to plot. Leave empty for cartesian charts to auto-derive from
     * the colored config entries; set explicitly for pie/radial (e.g. ['visitors']).
     *
     * @var array<int, string>
     */
    protected array $series = [];

    /** Extra render options (e.g. ['interactive' => true, 'stacked' => true, 'footer' => '…']). */
    protected array $options = [];

    /**
     * The chart rows (recharts data).
     *
     * @return array<int, array<string, mixed>>
     */
    abstract public function data(Request $request): array;

    /**
     * Series/category config: key => ['label' => string, 'color' => string].
     * For pie/radial, the colored keys are the slice categories.
     *
     * @return array<string, array{label: string, color?: string}>
     */
    abstract public function config(): array;

    public function heading(): ?string
    {
        return $this->heading;
    }

    public function description(): ?string
    {
        return $this->description;
    }

    public function type(): string
    {
        return $this->type;
    }

    public function xKey(): string
    {
        return $this->xKey;
    }

    /** Value series, explicit or derived from the colored config entries. */
    protected function resolveSeries(): array
    {
        if ($this->series !== []) {
            return array_values($this->series);
        }

        return array_values(array_keys(array_filter(
            $this->config(),
            fn ($entry) => isset($entry['color']),
        )));
    }

    /** The `charts[]` payload entry the frontend renders. */
    public function resolve(Request $request): array
    {
        return [
            'type' => $this->type,
            'heading' => $this->heading,
            'description' => $this->description,
            'xKey' => $this->xKey,
            'series' => $this->resolveSeries(),
            'config' => $this->config(),
            'data' => $this->data($request),
            'options' => (object) $this->options,
        ];
    }
}
