/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import path from "node:path";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig, mergeConfig } from "vitest/config";
import { reactConfig } from "@plane/vitest-config/react";

export default mergeConfig(
  reactConfig,
  defineConfig({
    plugins: [tsconfigPaths({ projects: [path.resolve(__dirname, "tsconfig.json")] })],
    test: {
      include: ["tests/**/*.{test,spec}.{ts,tsx}"],
      coverage: {
        // Ratchet: raise as coverage grows, never lower
        thresholds: { lines: 6, statements: 6, functions: 4, branches: 2 },
        include: [
          "app/**/*.{ts,tsx}",
          "components/**/*.{ts,tsx}",
          "helpers/**/*.{ts,tsx}",
          "hooks/**/*.{ts,tsx}",
          "lib/**/*.{ts,tsx}",
          "store/**/*.{ts,tsx}",
        ],
      },
    },
    resolve: {
      alias: {
        // Next.js compatibility shims, mirrored from vite.config.ts
        "next/navigation": path.resolve(__dirname, "app/compat/next/navigation.ts"),
      },
    },
  })
);
