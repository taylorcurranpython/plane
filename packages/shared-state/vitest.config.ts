/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import path from "node:path";
import { defineConfig, mergeConfig } from "vitest/config";
import { nodeConfig } from "@plane/vitest-config/node";

export default mergeConfig(
  nodeConfig,
  defineConfig({
    test: {
      coverage: {
        // Ratchet: raise as coverage grows, never lower
        thresholds: { lines: 49, statements: 47, functions: 51, branches: 46 },
      },
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  })
);
