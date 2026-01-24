// lib/table/columns/image-column.tsx
import { cn } from '@/lib/utils';
import { ColumnDef } from '@tanstack/react-table';
import { BaseColumn } from './base-column';
import { BaseColumnConfig } from './types';

interface ImageColumnConfig<TData> extends BaseColumnConfig<TData> {
    size?: 'sm' | 'md' | 'lg';
    rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
    fallback?: string;
    alt?: (row: TData) => string;
}

export class ImageColumn<TData> extends BaseColumn<TData, ImageColumnConfig<TData>> {
    constructor(accessor: keyof TData | string) {
        super(accessor);
        (this.config as ImageColumnConfig<TData>).size = 'md';
        (this.config as ImageColumnConfig<TData>).rounded = 'md';
    }

    static make<TData>(accessor: keyof TData | string): ImageColumn<TData> {
        return new ImageColumn(accessor);
    }

    size(size: 'sm' | 'md' | 'lg'): this {
        (this.config as ImageColumnConfig<TData>).size = size;
        return this;
    }

    rounded(rounded: 'none' | 'sm' | 'md' | 'lg' | 'full'): this {
        (this.config as ImageColumnConfig<TData>).rounded = rounded;
        return this;
    }

    circular(): this {
        return this.rounded('full');
    }

    square(): this {
        return this.rounded('none');
    }

    fallback(url: string): this {
        (this.config as ImageColumnConfig<TData>).fallback = url;
        return this;
    }

    alt(fn: (row: TData) => string): this {
        (this.config as ImageColumnConfig<TData>).alt = fn;
        return this;
    }

    build(): ColumnDef<TData, unknown> {
        const config = this.config as ImageColumnConfig<TData>;
        const { accessor, label, size, rounded, fallback, alt } = config;

        const sizeClasses = {
            sm: 'h-8 w-8',
            md: 'h-10 w-10',
            lg: 'h-12 w-12',
        };

        const roundedClasses = {
            none: 'rounded-none',
            sm: 'rounded-sm',
            md: 'rounded-md',
            lg: 'rounded-lg',
            full: 'rounded-full',
        };

        return {
            accessorKey: accessor as string,
            header: () => <span className={cn('text-muted-foreground font-medium', this.config.headerClassName)}>{label || ''}</span>,
            cell: ({ getValue, row }) => {
                const src = getValue() as string;
                const altText = alt ? alt(row.original) : 'Bild';

                return (
                    <img
                        src={src || fallback || '/placeholder.png'}
                        alt={altText}
                        className={cn('object-cover', sizeClasses[size || 'md'], roundedClasses[rounded || 'md'], this.config.cellClassName)}
                        onError={(e) => {
                            if (fallback) {
                                (e.target as HTMLImageElement).src = fallback;
                            }
                        }}
                    />
                );
            },
        };
    }
}

