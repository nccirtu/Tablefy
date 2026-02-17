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
export { createPrecognitionBlur } from "./precognition";
export type { UseInertiaFormOptions, UseInertiaFormReturn, ServerTableConfig, ServerTableState, ServerTableReturn, PaginatedResponse } from "./types";
`
);

console.log("Fixed dist/inertia/index.d.ts");
