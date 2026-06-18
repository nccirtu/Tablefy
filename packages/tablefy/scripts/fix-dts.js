/**
 * Fix declaration files for sub-path exports.
 *
 * The TypeScript rollup plugin generates declarations for ALL source files
 * in every bundle, so the last bundle's `src/index.ts` declaration overwrites
 * the correct sub-path `index.d.ts` files. This script restores them.
 */
import { writeFileSync } from "fs";

// Fix dist/inertia/index.d.ts
writeFileSync(
  "dist/inertia/index.d.ts",
  `export { useInertiaForm } from "./use-inertia-form";
export { useServerTable } from "./use-server-table";
export { ServerDataTable } from "./server-data-table";
export { useTablefyNav, useTablefyNavGroups } from "./navigation";
export { TablefyPage } from "./tablefy-page";
export { TablefyTabs } from "./tablefy-tabs";
export { TablefySearch } from "./tablefy-search";
export { createPrecognitionBlur } from "./precognition";
export type { UseInertiaFormOptions, UseInertiaFormReturn, ServerTableConfig, ServerTableState, ServerTableReturn, PaginatedResponse } from "./types";
export type { TablefyNavItem, TablefyNavPayloadItem } from "./navigation";
export type { TablefyPageProps } from "./tablefy-page";
export type { TablefyTab, TablefyTabsProps } from "./tablefy-tabs";
export type { TablefySearchProps } from "./tablefy-search";
`
);

console.log("Fixed dist/inertia/index.d.ts");

// Fix dist/kanban/index.d.ts — re-export the correctly-rooted nested decl.
writeFileSync("dist/kanban/index.d.ts", `export * from "./kanban/index";\n`);

console.log("Fixed dist/kanban/index.d.ts");

// Fix dist/charts/index.d.ts — re-export the correctly-rooted nested decl.
writeFileSync("dist/charts/index.d.ts", `export * from "./charts/index";\n`);

console.log("Fixed dist/charts/index.d.ts");
