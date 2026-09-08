/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import path from "node:path";
import { defineConfig, mergeConfig } from "vitest/config";
import { reactConfig } from "@plane/vitest-config/react";

export default mergeConfig(
  reactConfig,
  defineConfig({
    test: {
      coverage: {
        // Ratchet: raise as coverage grows, never lower
        thresholds: { lines: 76, statements: 74, functions: 88, branches: 68 },
      },
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  })
);
