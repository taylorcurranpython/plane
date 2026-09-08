/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { test, expect } from "../support/fixtures";
import { ProjectPage } from "../support/pages/project.page";
import { WorkspacePage } from "../support/pages/workspace.page";
import { AUTH_STATE_PATH } from "../support/env";
import { readSession, uniqueSuffix } from "../support/session";

test.describe("work items", () => {
  let projectId: string;
  let identifier: string;

  test.beforeAll(async ({ browser }) => {
    // One dedicated project for this file so the list assertions are not
    // affected by the demo project's seeded work items.
    const session = readSession();
    const context = await browser.newContext({ storageState: AUTH_STATE_PATH });
    try {
      const page = await context.newPage();
      const workspace = new WorkspacePage(page, session.workspaceSlug);
      await workspace.gotoProjects();
      ({ identifier, projectId } = await workspace.createProject(`E2E Work Items ${uniqueSuffix()}`));
    } finally {
      await context.close();
    }
  });

  test("creates a work item and shows it in the list", async ({ page, session }) => {
    const project = new ProjectPage(page, session.workspaceSlug, projectId);
    await project.gotoIssues();

    const title = `E2E work item ${uniqueSuffix()}`;
    await project.createWorkItem(title);

    await expect(project.workItemRow(title)).toBeVisible();
    await expect(page.getByText(new RegExp(`${identifier}-\\d+`)).first()).toBeVisible();
  });

  test("opens a work item and shows its title", async ({ page, session }) => {
    const project = new ProjectPage(page, session.workspaceSlug, projectId);
    await project.gotoIssues();

    const title = `E2E detail ${uniqueSuffix()}`;
    await project.createWorkItem(title);
    await project.workItemRow(title).click();

    await expect(page).toHaveURL(/\/(issues|browse)\//, { timeout: 30_000 });
    await expect(page.getByText(title, { exact: true }).first()).toBeVisible();
  });

  test("requires a title before saving", async ({ page, session }) => {
    const project = new ProjectPage(page, session.workspaceSlug, projectId);
    await project.gotoIssues();

    await page.getByRole("button", { name: "New work item" }).first().click();
    const titleInput = page.locator("input[name='name']");
    await expect(titleInput).toBeVisible();
    await page.getByRole("button", { name: "Save", exact: true }).click();
    await expect(titleInput).toBeVisible();
    await expect(page.getByText(/title is required/i)).toBeVisible();
  });
});
