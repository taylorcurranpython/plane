import { test, expect } from "../support/fixtures";
import { WorkspacePage } from "../support/pages/workspace.page";
import { uniqueSuffix } from "../support/session";

test.describe("projects", () => {
  test("lists the demo project created with the workspace", async ({ page, session }) => {
    const workspace = new WorkspacePage(page, session.workspaceSlug);
    await workspace.gotoProjects();
    await expect(workspace.projectCard(session.workspaceName)).toBeVisible();
  });

  test("creates a project from the projects page", async ({ page, session }) => {
    const workspace = new WorkspacePage(page, session.workspaceSlug);
    await workspace.gotoProjects();

    const projectName = `E2E Project ${uniqueSuffix()}`;
    const { identifier, projectId } = await workspace.createProject(projectName);

    await workspace.gotoProjects();
    const card = workspace.projectCard(projectName);
    await expect(card).toBeVisible();
    await expect(card).toContainText(identifier);

    await card.click();
    await expect(page).toHaveURL(new RegExp(`/${session.workspaceSlug}/projects/${projectId}/issues`), {
      timeout: 30_000,
    });
  });

  test("validates the project name is required", async ({ page, session }) => {
    const workspace = new WorkspacePage(page, session.workspaceSlug);
    await workspace.gotoProjects();
    await workspace.openCreateProjectModal();

    await page.getByRole("button", { name: "Create project", exact: true }).click();
    await expect(page.locator("input[name='name']")).toBeVisible();
    await expect(page.getByText(/name is required/i)).toBeVisible();
  });
});
