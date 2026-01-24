// lib/table/columns/link-column.tsx
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, ExternalLink } from 'lucide-react';
import { ReactNode } from 'react';
import { BaseColumn } from './base-column';
import { BaseColumnConfig } from './types';

interface LinkColumnConfig<TData> extends BaseColumnConfig<TData> {
    href?: string | ((row: TData) => string);
    external?: boolean;
    icon?: ReactNode;
    showExternalIcon?: boolean;
    underline?: 'always' | 'hover' | 'never';
    openInNewTab?: boolean;
    onClick?: (row: TData) => void;
}

export class LinkColumn<TData> extends BaseColumn<TData, LinkColumnConfig<TData>> {
    constructor(accessor: keyof TData | string) {
        super(accessor);
        const config = this.config as LinkColumnConfig<TData>;
        config.external = false;
        config.showExternalIcon = false;
        config.underline = 'hover';
        config.openInNewTab = false;
    }

    static make<TData>(accessor: keyof TData | string): LinkColumn<TData> {
        return new LinkColumn(accessor);
    }

    // URL setzen (statisch oder dynamisch)
    href(href: string | ((row: TData) => string)): this {
        (this.config as LinkColumnConfig<TData>).href = href;
        return this;
    }

    // URL aus einem anderen Feld nehmen
    urlFromField(field: keyof TData): this {
        (this.config as LinkColumnConfig<TData>).href = (row) => String(row[field]);
        return this;
    }

    // Externer Link (zeigt Icon)
    external(external = true): this {
        const config = this.config as LinkColumnConfig<TData>;
        config.external = external;
        config.showExternalIcon = external;
        config.openInNewTab = external;
        return this;
    }

    // Icon vor dem Text
    icon(icon: ReactNode): this {
        (this.config as LinkColumnConfig<TData>).icon = icon;
        return this;
    }

    // External-Icon anzeigen
    showExternalIcon(show = true): this {
        (this.config as LinkColumnConfig<TData>).showExternalIcon = show;
        return this;
    }

    // Unterstreichung
    underline(style: 'always' | 'hover' | 'never'): this {
        (this.config as LinkColumnConfig<TData>).underline = style;
        return this;
    }

    // In neuem Tab öffnen
    openInNewTab(open = true): this {
        (this.config as LinkColumnConfig<TData>).openInNewTab = open;
        return this;
    }

    // Click-Handler (für programmatische Navigation)
    onClick(handler: (row: TData) => void): this {
        (this.config as LinkColumnConfig<TData>).onClick = handler;
        return this;
    }

    build(): ColumnDef<TData, unknown> {
        const config = this.config as LinkColumnConfig<TData>;
        const { accessor, label, sortable, href, icon, showExternalIcon, underline, openInNewTab, onClick } = config;

        const underlineClasses = {
            always: 'underline',
            hover: 'hover:underline',
            never: 'no-underline',
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
            cell: ({ getValue, row }) => {
                const value = getValue() as string;

                if (!value) {
                    return <span className="text-muted-foreground">—</span>;
                }

                // URL berechnen
                const url = typeof href === 'function' ? href(row.original) : href || value;

                const handleClick = (e: React.MouseEvent) => {
                    if (onClick) {
                        e.preventDefault();
                        onClick(row.original);
                    }
                };

                // Alignment ohne text-muted-foreground für Links
                const alignmentClass = this.config.align === 'center' ? 'text-center' : this.config.align === 'right' ? 'text-right' : 'text-left';

                return (
                    <a
                        href={url}
                        target={openInNewTab ? '_blank' : undefined}
                        rel={openInNewTab ? 'noopener noreferrer' : undefined}
                        onClick={onClick ? handleClick : undefined}
                        className={cn(
                            'inline-flex items-center gap-1.5 text-sm text-blue-500',
                            underlineClasses[underline || 'hover'],
                            'hover:text-blue-500/80',
                            alignmentClass,
                            this.config.cellClassName,
                        )}
                    >
                        {icon}
                        <span>{value}</span>
                        {showExternalIcon && <ExternalLink className="text-muted-foreground h-3 w-3" />}
                    </a>
                );
            },
        };
    }
}
