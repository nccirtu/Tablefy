// lib/table/columns/progress-column.tsx
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';
import { BaseColumn } from './base-column';
import { BaseColumnConfig } from './types';

interface ProgressColumnConfig<TData> extends BaseColumnConfig<TData> {
    max?: number;
    showValue?: boolean;
    showPercentage?: boolean;
    size?: 'sm' | 'md' | 'lg';
    color?: 'default' | 'success' | 'warning' | 'danger' | ((value: number, max: number) => string);
    thresholds?: {
        warning?: number;
        danger?: number;
    };
    format?: (value: number, max: number) => string;
}

export class ProgressColumn<TData> extends BaseColumn<TData, ProgressColumnConfig<TData>> {
    constructor(accessor: keyof TData | string) {
        super(accessor);
        const config = this.config as ProgressColumnConfig<TData>;
        config.max = 100;
        config.showValue = false;
        config.showPercentage = true;
        config.size = 'md';
        config.color = 'default';
    }

    static make<TData>(accessor: keyof TData | string): ProgressColumn<TData> {
        return new ProgressColumn(accessor);
    }

    // Maximalwert setzen
    max(max: number): this {
        (this.config as ProgressColumnConfig<TData>).max = max;
        return this;
    }

    // Absoluten Wert anzeigen (z.B. "75/100")
    showValue(show = true): this {
        (this.config as ProgressColumnConfig<TData>).showValue = show;
        return this;
    }

    // Prozent anzeigen (z.B. "75%")
    showPercentage(show = true): this {
        (this.config as ProgressColumnConfig<TData>).showPercentage = show;
        return this;
    }

    // Keine Werte anzeigen
    hideLabel(): this {
        const config = this.config as ProgressColumnConfig<TData>;
        config.showValue = false;
        config.showPercentage = false;
        return this;
    }

    // Größe
    size(size: 'sm' | 'md' | 'lg'): this {
        (this.config as ProgressColumnConfig<TData>).size = size;
        return this;
    }

    // Feste Farbe
    color(color: 'default' | 'success' | 'warning' | 'danger'): this {
        (this.config as ProgressColumnConfig<TData>).color = color;
        return this;
    }

    // Dynamische Farbe basierend auf Schwellwerten
    colorByThreshold(warning = 50, danger = 25): this {
        const config = this.config as ProgressColumnConfig<TData>;
        config.thresholds = { warning, danger };
        config.color = (value, max) => {
            const percent = (value / max) * 100;
            if (percent <= danger) return 'danger';
            if (percent <= warning) return 'warning';
            return 'success';
        };
        return this;
    }

    // Umgekehrte Schwellwerte (z.B. für Kapazität - voll = schlecht)
    colorByThresholdInverse(warning = 75, danger = 90): this {
        const config = this.config as ProgressColumnConfig<TData>;
        config.thresholds = { warning, danger };
        config.color = (value, max) => {
            const percent = (value / max) * 100;
            if (percent >= danger) return 'danger';
            if (percent >= warning) return 'warning';
            return 'success';
        };
        return this;
    }

    // Custom Formatierung
    format(fn: (value: number, max: number) => string): this {
        (this.config as ProgressColumnConfig<TData>).format = fn;
        return this;
    }

    build(): ColumnDef<TData, unknown> {
        const config = this.config as ProgressColumnConfig<TData>;
        const { accessor, label, sortable, max, showValue, showPercentage, size, color, format } = config;

        const sizeClasses = {
            sm: 'h-1.5',
            md: 'h-2',
            lg: 'h-3',
        };

        const colorClasses = {
            default: '[&>div]:bg-primary',
            success: '[&>div]:bg-green-500',
            warning: '[&>div]:bg-yellow-500',
            danger: '[&>div]:bg-red-500',
        };

        return {
            accessorKey: accessor as string,
            header: ({ column }) => {
                const displayLabel = label || String(accessor);

                if (!sortable) {
                    return (
                        <span className={cn('text-muted-foreground font-medium', this.getAlignmentClass(), this.config.headerClassName)}>
                            {displayLabel}
                        </span>
                    );
                }

                return (
                    <Button
                        variant="table_header"
                        size="table_header"
                        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                        className={cn('text-muted-foreground font-medium', this.getAlignmentClass(), this.config.headerClassName)}
                    >
                        {displayLabel}
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                );
            },
            cell: ({ getValue }) => {
                const value = getValue() as number;
                const maxValue = max || 100;

                if (value === null || value === undefined) {
                    return <span className="text-muted-foreground">—</span>;
                }

                const percentage = Math.min(100, Math.max(0, (value / maxValue) * 100));

                // Farbe berechnen
                const currentColor = typeof color === 'function' ? color(value, maxValue) : color || 'default';

                // Label erstellen
                let labelText = '';
                if (format) {
                    labelText = format(value, maxValue);
                } else if (showValue) {
                    labelText = `${value}/${maxValue}`;
                } else if (showPercentage) {
                    labelText = `${Math.round(percentage)}%`;
                }

                return (
                    <div className={cn('flex min-w-[120px] items-center gap-3', this.config.cellClassName)}>
                        <Progress
                            value={percentage}
                            className={cn('flex-1', sizeClasses[size || 'md'], colorClasses[currentColor as keyof typeof colorClasses])}
                        />
                        {labelText && <span className="text-muted-foreground min-w-[3rem] text-right text-sm tabular-nums">{labelText}</span>}
                    </div>
                );
            },
        };
    }
}
