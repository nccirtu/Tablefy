// lib/table/columns/icon-column.tsx
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';
import { BaseColumn } from './base-column';
import { BaseColumnConfig } from './types';

interface IconState {
    icon: ReactNode | LucideIcon;
    label?: string;
    color?: string;
    bgColor?: string;
    tooltip?: string;
}

interface IconColumnConfig<TData> extends BaseColumnConfig<TData> {
    states?: Record<string, IconState>;
    size?: 'xs' | 'sm' | 'md' | 'lg';
    showLabel?: boolean;
    showTooltip?: boolean;
    withBackground?: boolean;
    defaultIcon?: ReactNode;
    defaultLabel?: string;
}

export class IconColumn<TData> extends BaseColumn<TData, IconColumnConfig<TData>> {
    constructor(accessor: keyof TData | string) {
        super(accessor);
        const config = this.config as IconColumnConfig<TData>;
        config.states = {};
        config.size = 'md';
        config.showLabel = false;
        config.showTooltip = true;
        config.withBackground = false;
        config.align = 'center';
    }

    static make<TData>(accessor: keyof TData | string): IconColumn<TData> {
        return new IconColumn(accessor);
    }

    // Einzelnen State definieren
    state(value: string, config: IconState): this {
        const c = this.config as IconColumnConfig<TData>;
        if (!c.states) c.states = {};
        c.states[value] = config;
        return this;
    }

    // Mehrere States auf einmal
    states(states: Record<string, IconState>): this {
        (this.config as IconColumnConfig<TData>).states = states;
        return this;
    }

    // Größe
    size(size: 'xs' | 'sm' | 'md' | 'lg'): this {
        (this.config as IconColumnConfig<TData>).size = size;
        return this;
    }

    // Label neben Icon anzeigen
    showLabel(show = true): this {
        (this.config as IconColumnConfig<TData>).showLabel = show;
        return this;
    }

    // Tooltip deaktivieren
    hideTooltip(): this {
        (this.config as IconColumnConfig<TData>).showTooltip = false;
        return this;
    }

    // Hintergrund anzeigen (runder Badge)
    withBackground(show = true): this {
        (this.config as IconColumnConfig<TData>).withBackground = show;
        return this;
    }

    // Default für unbekannte Werte
    default(icon: ReactNode, label?: string): this {
        const config = this.config as IconColumnConfig<TData>;
        config.defaultIcon = icon;
        config.defaultLabel = label;
        return this;
    }

    // === PRESET STATES ===

    // Boolean State (true/false)
    boolean(config?: {
        trueIcon?: ReactNode;
        falseIcon?: ReactNode;
        trueLabel?: string;
        falseLabel?: string;
        trueColor?: string;
        falseColor?: string;
        trueBgColor?: string;
        falseBgColor?: string;
    }): this {
        const c = this.config as IconColumnConfig<TData>;
        c.states = {
            true: {
                icon: config?.trueIcon || this.createCheckIcon(),
                label: config?.trueLabel || 'Ja',
                color: config?.trueColor || 'text-green-500',
                bgColor: config?.trueBgColor,
            },
            false: {
                icon: config?.falseIcon || this.createXIcon(),
                label: config?.falseLabel || 'Nein',
                color: config?.falseColor || 'text-red-500',
                bgColor: config?.falseBgColor,
            },
        };
        return this;
    }

    // Active/Inactive State
    activeInactive(): this {
        return this.states({
            active: {
                icon: this.createCircleIcon(),
                label: 'Aktiv',
                color: 'text-green-500',
                tooltip: 'Status: Aktiv',
            },
            inactive: {
                icon: this.createCircleIcon(),
                label: 'Inaktiv',
                color: 'text-gray-400',
                tooltip: 'Status: Inaktiv',
            },
        });
    }

    // Online/Offline/Away Status
    onlineStatus(): this {
        return this.states({
            online: {
                icon: this.createCircleIcon(),
                label: 'Online',
                color: 'text-green-500',
                bgColor: 'bg-green-500',
            },
            offline: {
                icon: this.createCircleIcon(),
                label: 'Offline',
                color: 'text-gray-400',
                bgColor: 'bg-gray-400',
            },
            away: {
                icon: this.createCircleIcon(),
                label: 'Abwesend',
                color: 'text-yellow-500',
                bgColor: 'bg-yellow-500',
            },
            busy: {
                icon: this.createCircleIcon(),
                label: 'Beschäftigt',
                color: 'text-red-500',
                bgColor: 'bg-red-500',
            },
        });
    }

    // Priority Icons
    priority(): this {
        return this.states({
            low: {
                icon: this.createArrowDownIcon(),
                label: 'Niedrig',
                color: 'text-blue-500',
            },
            medium: {
                icon: this.createMinusIcon(),
                label: 'Mittel',
                color: 'text-yellow-500',
            },
            high: {
                icon: this.createArrowUpIcon(),
                label: 'Hoch',
                color: 'text-orange-500',
            },
            critical: {
                icon: this.createAlertIcon(),
                label: 'Kritisch',
                color: 'text-red-500',
            },
        });
    }

    // Verification Status
    verification(): this {
        return this.states({
            verified: {
                icon: this.createShieldCheckIcon(),
                label: 'Verifiziert',
                color: 'text-green-500',
            },
            pending: {
                icon: this.createClockIcon(),
                label: 'Ausstehend',
                color: 'text-yellow-500',
            },
            rejected: {
                icon: this.createShieldXIcon(),
                label: 'Abgelehnt',
                color: 'text-red-500',
            },
        });
    }

    // === ICON HELPERS (inline SVGs um Lucide-Abhängigkeit zu vermeiden) ===

    private createCheckIcon(): ReactNode {
        return (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-full w-full"
            >
                <polyline points="20 6 9 17 4 12" />
            </svg>
        );
    }

    private createXIcon(): ReactNode {
        return (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-full w-full"
            >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
        );
    }

    private createCircleIcon(): ReactNode {
        return (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-full w-full">
                <circle cx="12" cy="12" r="6" />
            </svg>
        );
    }

    private createArrowUpIcon(): ReactNode {
        return (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-full w-full"
            >
                <line x1="12" y1="19" x2="12" y2="5" />
                <polyline points="5 12 12 5 19 12" />
            </svg>
        );
    }

    private createArrowDownIcon(): ReactNode {
        return (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-full w-full"
            >
                <line x1="12" y1="5" x2="12" y2="19" />
                <polyline points="19 12 12 19 5 12" />
            </svg>
        );
    }

    private createMinusIcon(): ReactNode {
        return (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-full w-full"
            >
                <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
        );
    }

    private createAlertIcon(): ReactNode {
        return (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-full w-full"
            >
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
        );
    }

    private createShieldCheckIcon(): ReactNode {
        return (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-full w-full"
            >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <polyline points="9 12 11 14 15 10" />
            </svg>
        );
    }

    private createShieldXIcon(): ReactNode {
        return (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-full w-full"
            >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <line x1="9" y1="9" x2="15" y2="15" />
                <line x1="15" y1="9" x2="9" y2="15" />
            </svg>
        );
    }

    private createClockIcon(): ReactNode {
        return (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-full w-full"
            >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
            </svg>
        );
    }

    build(): ColumnDef<TData, unknown> {
        const config = this.config as IconColumnConfig<TData>;
        const { accessor, label, sortable, states, size, showLabel, showTooltip, withBackground, defaultIcon, defaultLabel } = config;

        const sizeClasses = {
            xs: 'h-3 w-3',
            sm: 'h-4 w-4',
            md: 'h-5 w-5',
            lg: 'h-6 w-6',
        };

        const bgSizeClasses = {
            xs: 'h-5 w-5',
            sm: 'h-6 w-6',
            md: 'h-8 w-8',
            lg: 'h-10 w-10',
        };

        const iconInBgSizeClasses = {
            xs: 'h-2.5 w-2.5',
            sm: 'h-3 w-3',
            md: 'h-4 w-4',
            lg: 'h-5 w-5',
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
                const value = String(getValue());
                const stateConfig = states?.[value];

                // Default verwenden wenn State nicht gefunden
                const icon = stateConfig?.icon || defaultIcon;
                const stateLabel = stateConfig?.label || defaultLabel || value;
                const color = stateConfig?.color || 'text-muted-foreground';
                const bgColor = stateConfig?.bgColor;
                const tooltip = stateConfig?.tooltip || stateLabel;

                if (!icon) {
                    return <span className="text-muted-foreground">—</span>;
                }

                // Icon als Element rendern (falls LucideIcon übergeben wurde)
                const IconElement = typeof icon === 'function' ? (icon as LucideIcon) : null;
                const renderedIcon = IconElement ? <IconElement className="h-full w-full" /> : (icon as ReactNode);

                const iconElement = (
                    <div className={cn('flex items-center gap-2', this.getAlignmentClass(), this.config.cellClassName)}>
                        {withBackground ? (
                            <div
                                className={cn(
                                    'inline-flex items-center justify-center rounded-md',
                                    bgSizeClasses[size || 'md'],
                                    bgColor || 'bg-blue-50',
                                )}
                            >
                                <div className={cn(iconInBgSizeClasses[size || 'md'], color)}>{renderedIcon}</div>
                            </div>
                        ) : (
                            <div className={cn(sizeClasses[size || 'md'], color)}>{renderedIcon}</div>
                        )}

                        {showLabel && <span className={cn('text-sm', color)}>{stateLabel}</span>}
                    </div>
                );

                if (showTooltip) {
                    return (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>{iconElement}</TooltipTrigger>
                                <TooltipContent>
                                    <p>{tooltip}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    );
                }

                return iconElement;
            },
        };
    }
}

