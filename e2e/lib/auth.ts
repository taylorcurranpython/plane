import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";

/**
 * Page object for the web app's email + password authentication flow.
 *
 * Selectors rely on the `data-testid` attributes in
 * apps/web/core/components/account/auth-forms/{email,password}.tsx.
 */
export class AuthPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly continueButton: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly signInButton: Locator;
  readonly signUpButton: Locator;
  readonly errorBanner: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByTestId("auth-email-input");
    this.continueButton = page.getByTestId("auth-continue-button");
    this.passwordInput = page.getByTestId("auth-password-input");
    this.confirmPasswordInput = page.getByTestId("auth-confirm-password-input");
    this.signInButton = page.getByTestId("auth-sign-in-button");
    this.signUpButton = page.getByTestId("auth-sign-up-button");
    this.errorBanner = page.getByTestId("auth-error-banner");
  }

  async gotoSignIn() {
    await this.page.goto("/");
    await expect(this.emailInput).toBeVisible();
  }

  async gotoSignUp() {
    await this.page.goto("/sign-up");
    await expect(this.emailInput).toBeVisible();
  }

  async submitEmail(email: string) {
    await this.emailInput.fill(email);
    await this.continueButton.click();
    await expect(this.passwordInput).toBeVisible();
  }

  async signIn(email: string, password: string) {
    await this.gotoSignIn();
    await this.submitEmail(email);
    await this.passwordInput.fill(password);
    await this.signInButton.click();
  }

  async signUp(email: string, password: string) {
    await this.gotoSignUp();
    await this.submitEmail(email);
    await this.passwordInput.fill(password);
    await this.confirmPasswordInput.fill(password);
    await this.signUpButton.click();
  }

  async expectRedirectedToWorkspace(workspaceSlug: string) {
    await expect(this.page).toHaveURL(new RegExp(`/${workspaceSlug}(/|$)`));
  }

  async expectRedirectedToOnboarding() {
    await expect(this.page).toHaveURL(/\/onboarding(\/|$|\?)/);
  }
}
