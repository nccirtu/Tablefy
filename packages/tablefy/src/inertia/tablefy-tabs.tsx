import { type ReactNode, useEffect, useRef } from "react";
import { router, usePage } from "@inertiajs/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

export interface TablefyTab {
  value: string;
  label: ReactNode;
  /**
   * Tab content. For a normal tab pass a node; for a lazy tab (with `lazy`)
   * pass a render function that receives the loaded prop value.
   */
  content: ReactNode | ((data: unknown) => ReactNode);
  /**
   * Name of an Inertia **optional** prop to load the first time this tab is
   * opened (lazy relation tab). The backend declares it via `Inertia::optional`
   * so it is fetched only on demand. Omit for a normal, always-rendered tab.
   */
  lazy?: string;
  /** Custom skeleton while a lazy prop loads (defaults to a few skeleton rows). */
  skeleton?: ReactNode;
}

export interface TablefyTabsProps {
  tabs: TablefyTab[];
  /** Initially active tab (defaults to the first). */
  defaultValue?: string;
  className?: string;
}

/**
 * Tab strip for view pages. A tab with `lazy: "posts"` loads that relation only
 * when the tab is first opened (partial reload `only: ["posts"]`) and shows a
 * skeleton until the data arrives — so a record's relations never block the
 * initial page render.
 */
export function TablefyTabs({ tabs, defaultValue, className }: TablefyTabsProps) {
  const first = defaultValue ?? tabs[0]?.value;

  return (
    <Tabs defaultValue={first} className={className}>
      <TabsList>
        {tabs.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {tabs.map((tab) => (
        <TabsContent key={tab.value} value={tab.value} className="mt-4">
          {tab.lazy ? (
            <LazyTab
              name={tab.lazy}
              render={tab.content as (data: unknown) => ReactNode}
              skeleton={tab.skeleton}
            />
          ) : (
            (tab.content as ReactNode)
          )}
        </TabsContent>
      ))}
    </Tabs>
  );
}

/**
 * Mounted only when its tab is active (Radix unmounts inactive content), so the
 * load fires on first activation. Once loaded the prop stays in the page props,
 * so re-opening the tab does not re-fetch.
 */
function LazyTab({
  name,
  render,
  skeleton,
}: {
  name: string;
  render: (data: unknown) => ReactNode;
  skeleton?: ReactNode;
}) {
  const page = usePage();
  const value = (page.props as Record<string, unknown>)[name];
  const requested = useRef(false);

  useEffect(() => {
    if (value === undefined && !requested.current) {
      requested.current = true;
      router.reload({ only: [name] });
    }
  }, [name, value]);

  if (value === undefined) {
    return <>{skeleton ?? <TabSkeleton />}</>;
  }

  return <>{render(value)}</>;
}

function TabSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={`tab-skeleton-${i}`} className="h-8 w-full" />
      ))}
    </div>
  );
}
