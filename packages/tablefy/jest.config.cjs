/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "jsdom",
  rootDir: ".",
  roots: ["<rootDir>/src", "<rootDir>/test"],
  setupFilesAfterEnv: ["<rootDir>/test/setup.ts"],
  moduleNameMapper: {
    "^@/lib/utils$": "<rootDir>/test/mocks/utils.ts",
    "^@/components/ui/(.*)$": "<rootDir>/test/mocks/shadcn.js",
    "^@inertiajs/react$": "<rootDir>/test/mocks/inertia.tsx",
  },
  transform: {
    "^.+\\.(ts|tsx)$": [
      "ts-jest",
      { tsconfig: "<rootDir>/tsconfig.test.json" },
    ],
  },
  testMatch: ["<rootDir>/test/**/*.test.ts", "<rootDir>/test/**/*.test.tsx"],
  clearMocks: true,
};
