import { type ReactNode } from "react";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { resolveLucideIcon } from "../lib/icons";
import type {
  StatColor,
  StatData,
  StatGroupData,
  StatsConfig,
} from "../types/stats";

/** Static column classes so Tailwind keeps them (no dynamic class names). */
const GRID_COLS: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  5: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-5",
  6: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-6",
};

const ACCENT: Record<StatColor, string> = {
  default: "text-foreground",
  primary: "text-primary",
  success: "text-emerald-600 dark:text-emerald-500",
  danger: "text-red-600 dark:text-red-500",
  warning: "text-amber-600 dark:text-amber-500",
  info: "text-sky-600 dark:text-sky-500",
};

const TREND_ACCENT = {
  up: "text-emerald-600 dark:text-emerald-500",
  down: "text-red-600 dark:text-red-500",
  neutral: "text-muted-foreground",
} as const;

const TREND_ICON = {
  up: TrendingUp,
  down: TrendingDown,
  neutral: Minus,
} as const;

/** Default card for a single resolved stat. */
export function StatCard({ stat }: { stat: StatData }) {
  const Icon = resolveLucideIcon(stat.icon);
  const TrendIcon = stat.trend ? TREND_ICON[stat.trend.direction] : null;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            {stat.label}
          </span>
          {Icon ? (
            <Icon className="h-4 w-4 text-muted-foreground" aria-hidden />
          ) : null}
        </div>

        <div
          className={cn(
            "mt-2 text-2xl font-semibold tracking-tight",
            ACCENT[stat.color ?? "default"],
          )}
        >
          {stat.value}
        </div>

        {(stat.description || stat.trend) && (
          <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            {stat.trend && TrendIcon ? (
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 font-medium",
                  TREND_ACCENT[stat.trend.direction],
                )}
              >
                <TrendIcon className="h-3.5 w-3.5" aria-hidden />
                {stat.trend.label}
              </span>
            ) : null}
            {stat.description ? <span>{stat.description}</span> : null}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/** Skeleton placeholder shown while stats are loading (deferred). */
function StatCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-4 rounded" />
        </div>
        <Skeleton className="mt-3 h-7 w-20" />
        <Skeleton className="mt-2 h-3 w-28" />
      </CardContent>
    </Card>
  );
}

function normalizeGroups(
  data: StatGroupData[] | StatGroupData | StatData[] | undefined,
): StatGroupData[] | undefined {
  if (data == null) return undefined;
  if (!Array.isArray(data)) return [data];
  if (data.length === 0) return [];
  // Array of StatData (flat) vs array of StatGroupData.
  if ("stats" in data[0]) return data as StatGroupData[];
  return [{ stats: data as StatData[] }];
}

export interface TablefyStatsProps {
  /** Resolved stats from the backend. `undefined` → skeleton (deferred). */
  data?: StatGroupData[] | StatGroupData | StatData[];
  /** Presentation schema (`Stats.make()`) or a built config. */
  schema?: { build(): StatsConfig } | StatsConfig;
  /** Column override (wins over schema + per-group). */
  columns?: number;
  /** Placeholder cards to show while loading. */
  skeletonCount?: number;
  className?: string;
}

/**
 * Renders a stats overview. Backend computes the numbers; this renders the
 * grid of cards and shows skeletons while the deferred prop streams in.
 */
export function TablefyStats({
  data,
  schema,
  columns,
  skeletonCount = 4,
  className,
}: TablefyStatsProps) {
  const config: StatsConfig =
    schema == null
      ? {}
      : typeof (schema as { build?: unknown }).build === "function"
        ? (schema as { build(): StatsConfig }).build()
        : (schema as StatsConfig);
  const groups = normalizeGroups(data);
  const loading = groups === undefined;

  const renderCard = (stat: StatData): ReactNode => {
    const custom =
      config.renderers?.[stat.name]?.(stat) ?? config.renderCard?.(stat);
    return custom ?? <StatCard stat={stat} />;
  };

  if (loading) {
    const cols = columns ?? config.columns ?? 4;
    return (
      <div className={cn("grid gap-4", GRID_COLS[cols] ?? GRID_COLS[4], className)}>
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <StatCardSkeleton key={`stat-skeleton-${i}`} />
        ))}
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {groups.map((group, gi) => {
        const cols = columns ?? group.columns ?? config.columns ?? 4;
        return (
          <div key={group.heading ?? gi} className="space-y-3">
            {group.heading ? (
              <h2 className="text-sm font-medium text-muted-foreground">
                {group.heading}
              </h2>
            ) : null}
            <div className={cn("grid gap-4", GRID_COLS[cols] ?? GRID_COLS[4])}>
              {group.stats.map((stat) => (
                <div key={stat.name}>{renderCard(stat)}</div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
