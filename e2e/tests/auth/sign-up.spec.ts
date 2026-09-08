/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { expect, test } from "@playwright/test";
import { E2E_USER, uniqueEmail } from "../../lib/api";
import { AuthPage } from "../../lib/auth";

test.describe("sign up", () => {
  test("creates an account with a fresh email and lands on onboarding", async ({ page }) => {
    const auth = new AuthPage(page);

    await auth.signUp(uniqueEmail(), "Str0ng-e2e-password!");

    await auth.expectRedirectedToOnboarding();
    await expect(auth.emailInput).toBeHidden();
  });

  test("switches to sign in when the email is already registered", async ({ page }) => {
    const auth = new AuthPage(page);

    await auth.gotoSignUp();
    await auth.submitEmail(E2E_USER.email);

    await expect(auth.signInButton).toBeVisible();
    await expect(auth.confirmPasswordInput).toBeHidden();
  });
});
