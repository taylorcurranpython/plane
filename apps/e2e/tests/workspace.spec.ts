/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { test, expect } from "../support/fixtures";
import { WorkspacePage } from "../support/pages/workspace.page";

test.describe("workspace", () => {
  test("home shows the greeting and the sidebar navigation", async ({ page, session }) => {
    const workspace = new WorkspacePage(page, session.workspaceSlug);
    await workspace.gotoHome();

    await expect(page.getByText(session.displayName).first()).toBeVisible();
    await Promise.all(
      ["Home", "Your work", "Drafts", "Projects"].map((label) => expect(workspace.sidebarLink(label)).toBeVisible())
    );
  });

  test("sidebar links navigate to their pages", async ({ page, session }) => {
    const workspace = new WorkspacePage(page, session.workspaceSlug);
    await workspace.gotoHome();

    await workspace.sidebarLink("Drafts").click();
    await expect(page).toHaveURL(new RegExp(`/${session.workspaceSlug}/drafts/?`));

    await workspace.sidebarLink("Your work").click();
    await expect(page).toHaveURL(new RegExp(`/${session.workspaceSlug}/profile/`));

    await workspace.sidebarLink("Projects").click();
    await expect(page).toHaveURL(new RegExp(`/${session.workspaceSlug}/projects/?`));
  });

  test("workspace root redirects a signed-in user to their workspace", async ({ page, session }) => {
    await page.goto("/");
    await expect(page).toHaveURL(new RegExp(`/${session.workspaceSlug}/`), { timeout: 30_000 });
  });
});
