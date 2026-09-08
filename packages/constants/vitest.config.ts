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
        thresholds: { lines: 20, statements: 20, functions: 9, branches: 38 },
      },
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  })
);
