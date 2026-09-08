import { expect, type Page } from "@playwright/test";

export class OnboardingPage {
  constructor(private readonly page: Page) {}

  async expectProfileStep() {
    await expect(this.page).toHaveURL(/\/onboarding\/?/);
    await expect(this.page.getByText("Create your profile.")).toBeVisible();
  }

  /** Names may only contain letters, spaces, hyphens and apostrophes. */
  async completeProfile(displayName: string) {
    await this.page.locator("input[name='first_name']").fill(displayName);
    const continueButton = this.page.getByRole("button", { name: "Continue" });
    await expect(continueButton).toBeEnabled();
    await continueButton.click();
    await expect(this.page.getByText("Create your workspace")).toBeVisible();
  }

  /** Returns the slug the app derived from the workspace name. */
  async createWorkspace(workspaceName: string) {
    await this.page.locator("input[name='name']").fill(workspaceName);
    const slug = await this.page.locator("input[name='slug']").inputValue();
    expect(slug).not.toEqual("");
    await this.page.getByRole("button", { name: "Just myself" }).click();
    await this.page.getByRole("button", { name: "Create workspace" }).click();
    await expect(this.page).toHaveURL(new RegExp(`/${slug}/`), { timeout: 30_000 });
    return slug;
  }

  async dismissProductTour() {
    const skip = this.page.getByRole("button", { name: "No thanks, I will explore it myself" });
    if (await skip.isVisible({ timeout: 10_000 }).catch(() => false)) {
      await skip.click();
      await expect(skip).toBeHidden();
    }
  }
}
