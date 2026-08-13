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
export { TablefyNotifications, setTablefyNotificationDefaults } from "./tablefy-notifications";
export { TablefyHeaderActions } from "./tablefy-header-actions";
export { TablefyToaster, toast } from "./tablefy-toaster";
export { createPrecognitionBlur } from "./precognition";
export type { UseInertiaFormOptions, UseInertiaFormReturn, ServerTableConfig, ServerTableState, ServerTableReturn, PaginatedResponse } from "./types";
export type { TablefyNavItem, TablefyNavPayloadItem } from "./navigation";
export type { TablefyPageProps } from "./tablefy-page";
export type { TablefyTab, TablefyTabsProps } from "./tablefy-tabs";
export type { TablefySearchProps } from "./tablefy-search";
export type { TablefyNotificationsProps, PollInterval } from "./tablefy-notifications";
export type { TablefyHeaderActionsProps } from "./tablefy-header-actions";
export type { TablefyToasterProps } from "./tablefy-toaster";
`
);

console.log("Fixed dist/inertia/index.d.ts");

// Fix dist/kanban/index.d.ts — re-export the correctly-rooted nested decl.
writeFileSync("dist/kanban/index.d.ts", `export * from "./kanban/index";\n`);

console.log("Fixed dist/kanban/index.d.ts");

// Fix dist/charts/index.d.ts — re-export the correctly-rooted nested decl.
writeFileSync("dist/charts/index.d.ts", `export * from "./charts/index";\n`);

console.log("Fixed dist/charts/index.d.ts");

// Fix dist/cards/index.d.ts — re-export the correctly-rooted nested decl.
writeFileSync("dist/cards/index.d.ts", `export * from "./cards/index";\n`);

console.log("Fixed dist/cards/index.d.ts");

// Fix dist/card/index.d.ts — re-export the correctly-rooted nested decl.
writeFileSync("dist/card/index.d.ts", `export * from "./card/index";\n`);

console.log("Fixed dist/card/index.d.ts");

// Fix dist/forms/index.d.ts — re-export the correctly-rooted nested decl.
// (Without this, the main index's d.ts leaks here and `Section` resolves to
// the page-layout Section instead of the forms Section.)
writeFileSync("dist/forms/index.d.ts", `export * from "./forms/index";\n`);

console.log("Fixed dist/forms/index.d.ts");
