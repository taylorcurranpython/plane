/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { fileURLToPath } from "node:url";
import { defineConfig, mergeConfig } from "vitest/config";
import { nodeConfig } from "./node.js";

/**
 * Preset for React packages and apps: jsdom environment plus `@testing-library/jest-dom` matchers.
 * Consumers must declare `jsdom` in their own devDependencies so Vitest can resolve it.
 */
export const reactConfig = mergeConfig(
  nodeConfig,
  defineConfig({
    test: {
      environment: "jsdom",
      setupFiles: [fileURLToPath(new URL("./setup.js", import.meta.url))],
      css: false,
    },
  })
);

export default reactConfig;
