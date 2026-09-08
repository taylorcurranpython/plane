/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import fs from "node:fs";
import { AUTH_DIR, SESSION_PATH } from "./env";

/** Data produced by the setup project and shared with every spec. */
export type TestSession = {
  email: string;
  password: string;
  displayName: string;
  workspaceName: string;
  workspaceSlug: string;
};

export const writeSession = (session: TestSession) => {
  fs.mkdirSync(AUTH_DIR, { recursive: true });
  fs.writeFileSync(SESSION_PATH, JSON.stringify(session, null, 2));
};

export const readSession = (): TestSession => {
  if (!fs.existsSync(SESSION_PATH)) {
    throw new Error(
      `Missing ${SESSION_PATH}. Run the "setup" project first (it runs automatically with \`playwright test\`).`
    );
  }
  return JSON.parse(fs.readFileSync(SESSION_PATH, "utf8")) as TestSession;
};

/** Unique, human-readable suffix for names that must not collide across runs. */
export const uniqueSuffix = () => `${Date.now().toString(36)}${Math.floor(Math.random() * 1e4).toString(36)}`;
