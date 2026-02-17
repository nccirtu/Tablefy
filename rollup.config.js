import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import { defineConfig } from "rollup";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// External dependencies - these won't be bundled
const external = [
  "react",
  "react-dom",
  "react/jsx-runtime",
  "@tanstack/react-table",
  "lucide-react",
  "@radix-ui/react-icons",
  "tailwindcss",
  "clsx",
  "class-variance-authority",
  "tailwind-merge",
  "zod",
];

// Check if import should be external
function isExternal(id) {
  if (external.includes(id)) return true;
  // All @/ imports are from user's project (shadcn components and utils)
  if (id.startsWith("@/")) return true;
  return false;
}

// Extended external check for inertia bundle
function isExternalInertia(id) {
  if (isExternal(id)) return true;
  if (id.startsWith("@inertiajs/")) return true;
  return false;
}

const suppressWarnings = {
  onwarn(warning, warn) {
    if (warning.code === "MODULE_LEVEL_DIRECTIVE") return;
    if (
      warning.code === "UNRESOLVED_IMPORT" &&
      warning.exporter?.startsWith("@/")
    )
      return;
    warn(warning);
  },
};

const plugins = [
  resolve({
    extensions: [".ts", ".tsx", ".js", ".jsx"],
  }),
  commonjs(),
  typescript({
    tsconfig: "./tsconfig.build.json",
    declaration: true,
    declarationDir: "dist",
    noEmitOnError: false,
  }),
];

export default defineConfig([
  // Main library bundle
  {
    input: "src/index.ts",
    output: [
      {
        file: "dist/index.js",
        format: "cjs",
        sourcemap: true,
        exports: "named",
        interop: "auto",
      },
      {
        file: "dist/index.esm.js",
        format: "esm",
        sourcemap: true,
        exports: "named",
      },
    ],
    plugins,
    external: isExternal,
    ...suppressWarnings,
  },
  // Columns bundle
  {
    input: "src/columns/index.ts",
    output: [
      {
        file: "dist/columns/index.js",
        format: "cjs",
        sourcemap: true,
        exports: "named",
        interop: "auto",
      },
      {
        file: "dist/columns/index.esm.js",
        format: "esm",
        sourcemap: true,
        exports: "named",
      },
    ],
    plugins,
    external: isExternal,
    ...suppressWarnings,
  },
  // Forms bundle
  {
    input: "src/forms/index.ts",
    output: [
      {
        file: "dist/forms/index.js",
        format: "cjs",
        sourcemap: true,
        exports: "named",
        interop: "auto",
      },
      {
        file: "dist/forms/index.esm.js",
        format: "esm",
        sourcemap: true,
        exports: "named",
      },
    ],
    plugins,
    external: isExternal,
    ...suppressWarnings,
  },
  // Inertia integration bundle
  {
    input: "src/inertia/index.ts",
    output: [
      {
        file: "dist/inertia/index.js",
        format: "cjs",
        sourcemap: true,
        exports: "named",
        interop: "auto",
      },
      {
        file: "dist/inertia/index.esm.js",
        format: "esm",
        sourcemap: true,
        exports: "named",
      },
    ],
    plugins,
    external: isExternalInertia,
    ...suppressWarnings,
  },
]);
