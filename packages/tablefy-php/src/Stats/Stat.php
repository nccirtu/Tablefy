<?php

namespace Nccirtu\Tablefy\Stats;

use Illuminate\Support\Str;

/**
 * A single stat card. The backend computes the number; the frontend renders it
 * (`TablefyStats`). Mirrors the TS `StatData` contract one-to-one.
 *
 *   Stat::make('total_customers', Customer::count())
 *       ->label('Kunden')
 *       ->description('gesamt')
 *       ->icon('users')
 *       ->color('success')
 *       ->trend('up', '+12%');
 */
class Stat
{
    protected ?string $label = null;

    protected ?string $description = null;

    protected ?string $icon = null;

    protected ?string $color = null;

    /** @var array{direction: string, label: ?string}|null */
    protected ?array $trend = null;

    public function __construct(
        protected string $name,
        protected string|int|float $value,
    ) {}

    public static function make(string $name, string|int|float $value): static
    {
        return new static($name, $value);
    }

    public function label(string $label): static
    {
        $this->label = $label;

        return $this;
    }

    public function value(string|int|float $value): static
    {
        $this->value = $value;

        return $this;
    }

    public function description(string $description): static
    {
        $this->description = $description;

        return $this;
    }

    /** lucide icon name, e.g. 'users', 'dollar', 'cart'. */
    public function icon(string $icon): static
    {
        $this->icon = $icon;

        return $this;
    }

    /** 'default' | 'primary' | 'success' | 'danger' | 'warning' | 'info'. */
    public function color(string $color): static
    {
        $this->color = $color;

        return $this;
    }

    /**
     * @param  'up'|'down'|'neutral'  $direction
     */
    public function trend(string $direction, ?string $label = null): static
    {
        $this->trend = ['direction' => $direction, 'label' => $label];

        return $this;
    }

    /** @return array<string, mixed> */
    public function toArray(): array
    {
        return [
            'name' => $this->name,
            'label' => $this->label ?? Str::headline($this->name),
            'value' => $this->value,
            'description' => $this->description,
            'icon' => $this->icon,
            'color' => $this->color,
            'trend' => $this->trend,
        ];
    }
}
