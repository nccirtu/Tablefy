"use client";
import React, { ReactNode, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  RadialBar,
  RadialBarChart,
  LabelList,
  XAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { ChartBuildResult, ChartSchemaConfig, ChartWidgetData } from "../types";

export interface TablefyChartProps {
  chart: ChartWidgetData;
  /** Optional client-side overrides (a ChartSchema builder or its built result). */
  schema?: ChartBuildResult | ChartSchemaConfig | { build(): ChartBuildResult };
  className?: string;
}

const RANGE_DAYS: Record<string, number> = { "90d": 90, "30d": 30, "7d": 7 };

function resolveSchema(
  schema?: ChartBuildResult | ChartSchemaConfig | { build(): ChartBuildResult },
): ChartSchemaConfig {
  if (!schema) return {};
  if (typeof (schema as any).build === "function") {
    return (schema as { build(): ChartBuildResult }).build().config;
  }
  if ("config" in schema && (schema as ChartBuildResult).config) {
    return (schema as ChartBuildResult).config;
  }
  return schema as ChartSchemaConfig;
}

export function TablefyChart({
  chart,
  schema,
  className,
}: TablefyChartProps): ReactNode {
  const o = resolveSchema(schema);
  const type = o.type ?? chart.type;
  const xKey = o.xKey ?? chart.xKey;
  const series = o.series ?? chart.series;
  const config = (o.config ?? chart.config) as ChartConfig;
  const options = { ...chart.options, ...o.options };
  const heading = o.heading ?? chart.heading;
  const description = o.description ?? chart.description;

  const [timeRange, setTimeRange] = useState("90d");
  const interactive = type === "area" && options.interactive;

  // Per-slice fill for pie/radial (from the chart-config CSS vars).
  const sliceData = useMemo(
    () =>
      chart.data.map((row) => ({
        ...row,
        fill: row.fill ?? `var(--color-${row[xKey]})`,
      })),
    [chart.data, xKey],
  );

  const cartesianData = useMemo(() => {
    if (!interactive) return chart.data;
    const days = RANGE_DAYS[timeRange] ?? 90;
    const rows = chart.data;
    const ref = rows.length ? new Date(rows[rows.length - 1][xKey]) : new Date();
    const start = new Date(ref);
    start.setDate(start.getDate() - days);
    return rows.filter((r) => new Date(r[xKey]) >= start);
  }, [chart.data, interactive, timeRange, xKey]);

  const height = options.height ?? 250;
  const stackId = options.stacked ? "a" : undefined;
  const showLegend = series.length > 1;

  const body = (() => {
    switch (type) {
      case "area":
        return (
          <AreaChart data={cartesianData}>
            <defs>
              {series.map((s) => (
                <linearGradient key={s} id={`fill-${s}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={`var(--color-${s})`} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={`var(--color-${s})`} stopOpacity={0.1} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis dataKey={xKey} tickLine={false} axisLine={false} tickMargin={8} minTickGap={32} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
            {series.map((s) => (
              <Area
                key={s}
                dataKey={s}
                type="natural"
                fill={`url(#fill-${s})`}
                stroke={`var(--color-${s})`}
                stackId="a"
              />
            ))}
            {showLegend && <ChartLegend content={<ChartLegendContent />} />}
          </AreaChart>
        );
      case "line":
        return (
          <LineChart data={cartesianData}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey={xKey} tickLine={false} axisLine={false} tickMargin={8} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            {series.map((s) => (
              <Line key={s} dataKey={s} type="natural" stroke={`var(--color-${s})`} strokeWidth={2} dot={false} />
            ))}
            {showLegend && <ChartLegend content={<ChartLegendContent />} />}
          </LineChart>
        );
      case "bar":
      case "bar-multiple":
        return (
          <BarChart accessibilityLayer data={cartesianData}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey={xKey} tickLine={false} axisLine={false} tickMargin={10} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator={showLegend ? "dashed" : undefined} hideLabel={!showLegend} />} />
            {series.map((s) => (
              <Bar key={s} dataKey={s} fill={`var(--color-${s})`} radius={4} stackId={stackId} />
            ))}
            {showLegend && <ChartLegend content={<ChartLegendContent />} />}
          </BarChart>
        );
      case "radar":
        return (
          <RadarChart data={chart.data}>
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <PolarAngleAxis dataKey={xKey} />
            <PolarGrid />
            {series.map((s) => (
              <Radar key={s} dataKey={s} fill={`var(--color-${s})`} fillOpacity={0.6} dot={{ r: 4, fillOpacity: 1 }} />
            ))}
          </RadarChart>
        );
      case "radial":
        return (
          <RadialBarChart data={sliceData} startAngle={-90} endAngle={380} innerRadius={30} outerRadius={110}>
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel nameKey={xKey} />} />
            <RadialBar dataKey={series[0]} background>
              <LabelList position="insideStart" dataKey={xKey} className="fill-white capitalize mix-blend-luminosity" fontSize={11} />
            </RadialBar>
          </RadialBarChart>
        );
      case "pie":
        return (
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <Pie data={sliceData} dataKey={series[0]} nameKey={xKey} label />
          </PieChart>
        );
      default:
        return <div />;
    }
  })();

  const round = type === "pie" || type === "radar" || type === "radial";

  return (
    <Card className={cn(round && "flex flex-col", className)}>
      {(heading || description || interactive) && (
        <CardHeader className={cn("gap-1", round && "items-center")}>
          <div className="grid flex-1 gap-1">
            {heading && <CardTitle>{heading}</CardTitle>}
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          {interactive && (
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[150px]" aria-label="Zeitraum">
                <SelectValue placeholder="Letzte 3 Monate" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="90d">Letzte 3 Monate</SelectItem>
                <SelectItem value="30d">Letzte 30 Tage</SelectItem>
                <SelectItem value="7d">Letzte 7 Tage</SelectItem>
              </SelectContent>
            </Select>
          )}
        </CardHeader>
      )}
      <CardContent className={cn(round && "flex-1 pb-0")}>
        <ChartContainer
          config={config}
          className={cn(
            round ? "mx-auto aspect-square" : "aspect-auto w-full",
          )}
          style={{ maxHeight: height, height: round ? undefined : height }}
        >
          {body}
        </ChartContainer>
      </CardContent>
      {options.footer && (
        <CardFooter className="text-sm text-muted-foreground">
          {options.footer}
        </CardFooter>
      )}
    </Card>
  );
}
