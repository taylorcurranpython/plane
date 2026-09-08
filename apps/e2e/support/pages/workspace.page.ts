/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { expect, type Page } from "@playwright/test";

export class WorkspacePage {
  constructor(
    private readonly page: Page,
    readonly slug: string
  ) {}

  get sidebar() {
    return this.page.locator("aside, nav").first();
  }

  async gotoHome() {
    await this.page.goto(`/${this.slug}/`);
    await expect(this.page.getByRole("link", { name: "Projects", exact: true }).first()).toBeVisible();
  }

  async gotoProjects() {
    await this.page.goto(`/${this.slug}/projects/`);
    await expect(this.page.getByRole("button", { name: /add project/i }).first()).toBeVisible();
  }

  async openCreateProjectModal() {
    await this.page
      .getByRole("button", { name: /add project/i })
      .first()
      .click();
    await expect(this.page.locator("input[name='name']")).toBeVisible();
  }

  /**
   * Fills the create-project modal and submits it. Returns the identifier the
   * app derived from the name (used as the work item sequence prefix) and the
   * new project's id, read from the sidebar entry that appears once created.
   */
  async createProject(name: string) {
    await this.openCreateProjectModal();
    await this.page.locator("input[name='name']").fill(name);
    const identifier = (await this.page.locator("input[name='identifier']").inputValue()).toUpperCase();
    expect(identifier).not.toEqual("");
    await this.page.getByRole("button", { name: "Create project", exact: true }).click();
    await expect(this.page.locator("input[name='name']")).toBeHidden();

    const sidebarEntry = this.sidebarProjectLink(name);
    await expect(sidebarEntry).toBeVisible({ timeout: 30_000 });
    const href = await sidebarEntry.getAttribute("href");
    const projectId = href?.match(/\/projects\/([0-9a-f-]+)\//)?.[1];
    if (!projectId) throw new Error(`Could not read the project id from sidebar link "${href}".`);
    return { identifier, projectId };
  }

  get mainSidebar() {
    return this.page.getByRole("complementary", { name: "Main sidebar" });
  }

  sidebarLink(label: string) {
    return this.mainSidebar.getByRole("link", { name: label, exact: true }).first();
  }

  sidebarProjectLink(name: string) {
    return this.mainSidebar.getByRole("link", { name: "Open project menu" }).filter({ hasText: name }).first();
  }

  /** Card in the projects list page. */
  projectCard(name: string) {
    return this.page.getByRole("main").getByRole("link", { name }).first();
  }

  async signOut() {
    // The workspace switcher (top-left) holds the "Sign out" action.
    await this.page
      .getByRole("button", { name: /^[A-Z]\s*\S/ })
      .first()
      .click();
    await this.page
      .getByRole("menuitem", { name: "Sign out" })
      .or(this.page.getByText("Sign out", { exact: true }))
      .first()
      .click();
    await expect(this.page.locator("input[name='email']:not([type='hidden'])")).toBeVisible({ timeout: 30_000 });
  }
}
