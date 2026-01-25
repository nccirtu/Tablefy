import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import { defineConfig } from "rollup";

const external = [
  "react",
  "react-dom",
  "react/jsx-runtime",
  "@tanstack/react-table",
  "lucide-react",
  "@radix-ui/react-icons",
  "tailwindcss",
];

const plugins = [
  resolve(),
  commonjs(),
  typescript({
    tsconfig: "./tsconfig.json",
  }),
];

export default defineConfig([
  {
    input: "src/index.ts",
    output: [
      {
        file: "dist/index.js",
        format: "cjs",
        sourcemap: true,
      },
      {
        file: "dist/index.esm.js",
        format: "esm",
        sourcemap: true,
      },
    ],
    plugins,
    external,
  },
  {
    input: "src/columns/index.ts",
    output: [
      {
        file: "dist/columns/index.js",
        format: "cjs",
        sourcemap: true,
      },
      {
        file: "dist/columns/index.esm.js",
        format: "esm",
        sourcemap: true,
      },
    ],
    plugins,
    external,
  },
]);
