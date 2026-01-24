// lib/table/columns/date-column.tsx
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, Calendar } from 'lucide-react';
import { BaseColumn } from './base-column';
import { BaseColumnConfig } from './types';

interface DateColumnConfig<TData> extends BaseColumnConfig<TData> {
    format?: 'short' | 'long' | 'relative' | 'time' | 'datetime' | string;
    locale?: string;
    showIcon?: boolean;
}

export class DateColumn<TData> extends BaseColumn<TData, DateColumnConfig<TData>> {
    constructor(accessor: keyof TData | string) {
        super(accessor);
        (this.config as DateColumnConfig<TData>).format = 'short';
        (this.config as DateColumnConfig<TData>).locale = 'de-DE';
        (this.config as DateColumnConfig<TData>).showIcon = false;
    }

    static make<TData>(accessor: keyof TData | string): DateColumn<TData> {
        return new DateColumn(accessor);
    }

    format(format: 'short' | 'long' | 'relative' | 'time' | 'datetime'): this {
        (this.config as DateColumnConfig<TData>).format = format;
        return this;
    }

    locale(locale: string): this {
        (this.config as DateColumnConfig<TData>).locale = locale;
        return this;
    }

    withIcon(show = true): this {
        (this.config as DateColumnConfig<TData>).showIcon = show;
        return this;
    }

    // Shortcuts
    short(): this {
        return this.format('short');
    }
    long(): this {
        return this.format('long');
    }
    relative(): this {
        return this.format('relative');
    }
    time(): this {
        return this.format('time');
    }
    datetime(): this {
        return this.format('datetime');
    }

    private formatDate(date: Date, format: string, locale: string): string {
        if (format === 'relative') {
            return this.getRelativeTime(date);
        }

        const formatOptions: Record<string, Intl.DateTimeFormatOptions> = {
            short: { day: '2-digit', month: '2-digit', year: 'numeric' },
            long: { day: 'numeric', month: 'long', year: 'numeric' },
            time: { hour: '2-digit', minute: '2-digit' },
            datetime: { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' },
        };

        const options = formatOptions[format] || { day: '2-digit', month: '2-digit', year: 'numeric' };

        return new Intl.DateTimeFormat(locale, options).format(date);
    }

    private getRelativeTime(date: Date): string {
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        const intervals = [
            { label: 'Jahr', seconds: 31536000 },
            { label: 'Monat', seconds: 2592000 },
            { label: 'Woche', seconds: 604800 },
            { label: 'Tag', seconds: 86400 },
            { label: 'Stunde', seconds: 3600 },
            { label: 'Minute', seconds: 60 },
        ];

        for (const interval of intervals) {
            const count = Math.floor(diffInSeconds / interval.seconds);
            if (count >= 1) {
                const plural = count > 1 ? (interval.label === 'Monat' ? 'e' : 'en') : '';
                return `vor ${count} ${interval.label}${plural}`;
            }
        }

        return 'gerade eben';
    }

    build(): ColumnDef<TData, unknown> {
        const config = this.config as DateColumnConfig<TData>;
        const { accessor, label, sortable, format, locale, showIcon } = config;

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
                const value = getValue();

                if (!value) {
                    return <span className="text-muted-foreground">—</span>;
                }

                const date = value instanceof Date ? value : new Date(value as string);

                if (isNaN(date.getTime())) {
                    return <span className="text-muted-foreground">Ungültiges Datum</span>;
                }

                const formatted = this.formatDate(date, format || 'short', locale || 'de-DE');

                return (
                    <span className={cn('flex items-center gap-2', this.getAlignmentClass(), this.config.cellClassName)}>
                        {showIcon && <Calendar className="text-muted-foreground h-4 w-4" />}
                        {formatted}
                    </span>
                );
            },
        };
    }
}
