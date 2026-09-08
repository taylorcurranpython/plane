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
