import { expect, type Page } from "@playwright/test";

export class ProjectPage {
  constructor(
    private readonly page: Page,
    readonly workspaceSlug: string,
    readonly projectId: string
  ) {}

  get issuesUrl() {
    return `/${this.workspaceSlug}/projects/${this.projectId}/issues/`;
  }

  async gotoIssues() {
    await this.page.goto(this.issuesUrl);
    await expect(this.page).toHaveURL(new RegExp(`/projects/${this.projectId}/issues`));
  }

  /** Opens the "create work item" modal from the sidebar, fills the title and saves. */
  async createWorkItem(title: string) {
    await this.page.getByRole("button", { name: "New work item" }).first().click();
    const titleInput = this.page.locator("input[name='name']");
    await expect(titleInput).toBeVisible();
    await titleInput.fill(title);
    await this.page.getByRole("button", { name: "Save", exact: true }).click();
    await expect(titleInput).toBeHidden();
  }

  workItemRow(title: string) {
    return this.page.getByText(title, { exact: true }).first();
  }
}
