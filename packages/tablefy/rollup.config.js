import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import alias from "@rollup/plugin-alias";
import { defineConfig } from "rollup";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.resolve(__dirname, "src");

// A `@/...` import is "vendored" if a matching file exists under src/.
// Vendored UI primitives get BUNDLED into dist; the rest stay external
// (resolved from the consumer's shadcn project) until they are vendored too.
function vendoredPath(id) {
  if (!id.startsWith("@/")) return null;
  const base = path.join(srcDir, id.slice(2));
  const candidates = [
    `${base}.tsx`,
    `${base}.ts`,
    path.join(base, "index.tsx"),
    path.join(base, "index.ts"),
  ];
  return candidates.find((p) => fs.existsSync(p)) ?? null;
}

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
  "cmdk",
  // The dialog engine (in the main bundle) renders modal forms via Inertia, so
  // the main bundle imports @inertiajs/react — keep it external (peer).
  "@inertiajs/react",
];

// Check if import should be external
function isExternal(id) {
  if (external.includes(id)) return true;
  // Vendored @/ primitives are bundled; not-yet-vendored ones stay external.
  if (id.startsWith("@/")) return vendoredPath(id) === null;
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

function createPlugins() {
  return [
    // Resolve vendored `@/...` imports to the package's own src/ files.
    alias({
      entries: [{ find: /^@\//, replacement: `${srcDir}/` }],
    }),
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
}

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
    plugins: createPlugins(),
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
    plugins: createPlugins(),
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
    plugins: createPlugins(),
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
    plugins: createPlugins(),
    external: isExternalInertia,
    ...suppressWarnings,
  },
]);
