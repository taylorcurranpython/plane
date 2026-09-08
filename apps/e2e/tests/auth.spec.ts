/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { test, expect } from "../support/fixtures";
import { AuthPage } from "../support/pages/auth.page";
import { WorkspacePage } from "../support/pages/workspace.page";

const signInEmailInput = "input[name='email']:not([type='hidden'])";

test.describe("authentication", () => {
  // Every test here starts signed out so it cannot invalidate the shared
  // session used by the rest of the suite.
  test.use({ storageState: { cookies: [], origins: [] } });

  test("redirects anonymous visitors to the sign-in page", async ({ page, session }) => {
    await page.goto(`/${session.workspaceSlug}/`);
    await expect(page).toHaveURL(new RegExp(`next_path=/${session.workspaceSlug}/`));
    await expect(page.locator(signInEmailInput)).toBeVisible();
    await expect(page.getByText("Welcome back to Plane.")).toBeVisible();
  });

  test("rejects a wrong password", async ({ page, session }) => {
    const auth = new AuthPage(page);
    await auth.signIn(session.email, `${session.password}-wrong`);
    await expect(page).toHaveURL(/error_message=AUTHENTICATION_FAILED_SIGN_IN/);
    await expect(page.getByText("Authentication failed", { exact: false }).first()).toBeVisible();
    await expect(page.locator(signInEmailInput)).toBeVisible();
  });

  test("signs in with email and password", async ({ page, session }) => {
    const auth = new AuthPage(page);
    await auth.signIn(session.email, session.password);
    await expect(page).toHaveURL(new RegExp(`/${session.workspaceSlug}/`), { timeout: 30_000 });
    await expect(page.getByRole("link", { name: "Projects", exact: true }).first()).toBeVisible();
  });

  test("sign-up form asks for a password after a new email", async ({ page }) => {
    const auth = new AuthPage(page);
    await auth.gotoSignUp();
    await auth.submitEmail(`e2e-unused-${Date.now()}@plane.local`);
    await expect(page.locator("input[name='confirm_password']")).toBeVisible();
    await expect(page.getByRole("button", { name: "Create account" })).toBeDisabled();
  });

  test("signs out from the workspace menu", async ({ page, session }) => {
    const auth = new AuthPage(page);
    await auth.signIn(session.email, session.password);
    await expect(page).toHaveURL(new RegExp(`/${session.workspaceSlug}/`), { timeout: 30_000 });

    const workspace = new WorkspacePage(page, session.workspaceSlug);
    await workspace.signOut();

    await page.goto(`/${session.workspaceSlug}/`);
    await expect(page).toHaveURL(/next_path=/);
    await expect(page.locator(signInEmailInput)).toBeVisible();
  });
});
