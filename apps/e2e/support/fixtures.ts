/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { test as base } from "@playwright/test";
import { readSession, type TestSession } from "./session";

type Fixtures = {
  /** User + workspace produced by the setup project; read lazily so spec files can be collected before setup runs. */
  session: TestSession;
};

export const test = base.extend<Fixtures>({
  // oxlint-disable-next-line no-empty-pattern
  session: async ({}, use) => {
    await use(readSession());
  },
});

export { expect } from "@playwright/test";
