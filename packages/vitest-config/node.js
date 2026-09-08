/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { defineConfig } from "vitest/config";

/** Test-file globs shared by every preset: co-located `src/**\/*.test.ts(x)` or a `tests/` mirror. */
export const TEST_INCLUDE = ["src/**/*.{test,spec}.{ts,tsx}", "tests/**/*.{test,spec}.{ts,tsx}"];

export const COVERAGE_EXCLUDE = [
  "**/*.d.ts",
  "**/*.{test,spec}.{ts,tsx}",
  "**/*.stories.{ts,tsx}",
  "**/index.ts",
  "**/types.ts",
  "**/types/**",
];

/**
 * Base preset for packages that do not touch the DOM (pure logic, stores, services).
 * Consumers extend it with `mergeConfig(nodeConfig, defineConfig({ ... }))`.
 */
export const nodeConfig = defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: TEST_INCLUDE,
    passWithNoTests: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary", "lcov"],
      reportsDirectory: "./coverage",
      include: ["src/**/*.{ts,tsx}"],
      exclude: COVERAGE_EXCLUDE,
    },
  },
});

export default nodeConfig;
