/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { expect, type Page } from "@playwright/test";

export class AuthPage {
  constructor(private readonly page: Page) {}

  private get emailInput() {
    return this.page.locator("input[name='email']:not([type='hidden'])");
  }
  private get passwordInput() {
    return this.page.locator("input[name='password']");
  }
  private get confirmPasswordInput() {
    return this.page.locator("input[name='confirm_password']");
  }
  private get submitButton() {
    return this.page.locator("form button[type='submit']");
  }

  /** The sign-in form lives on the root route; `/sign-in/` also resolves to it. */
  async gotoSignIn() {
    await this.page.goto("/");
    await expect(this.emailInput).toBeVisible();
  }

  async gotoSignUp() {
    await this.page.goto("/sign-up/");
    await expect(this.emailInput).toBeVisible();
  }

  /** First step of both auth forms: submit the email to reveal the password step. */
  async submitEmail(email: string) {
    await this.emailInput.fill(email);
    await this.submitButton.click();
    await expect(this.passwordInput).toBeVisible();
  }

  async signUp(email: string, password: string) {
    await this.gotoSignUp();
    await this.submitEmail(email);
    await this.passwordInput.fill(password);
    await this.confirmPasswordInput.fill(password);
    await expect(this.submitButton).toBeEnabled();
    await this.submitButton.click();
  }

  async signIn(email: string, password: string) {
    await this.gotoSignIn();
    await this.submitEmail(email);
    await this.passwordInput.fill(password);
    await expect(this.submitButton).toBeEnabled();
    await this.submitButton.click();
  }
}
