/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { expect, test } from "@playwright/test";
import { E2E_USER } from "../../lib/api";
import { AuthPage } from "../../lib/auth";

test.describe("sign in", () => {
  test("signs in with email and password and lands on the workspace", async ({ page }) => {
    const auth = new AuthPage(page);

    await auth.signIn(E2E_USER.email, E2E_USER.password);

    await auth.expectRedirectedToWorkspace(E2E_USER.workspaceSlug);
    await expect(auth.emailInput).toBeHidden();
    // The sidebar workspace switcher shows the current workspace name once the app has booted.
    await expect(page.getByText(/^E2E$/i).first()).toBeVisible();
  });

  test("shows an error banner for a wrong password", async ({ page }) => {
    const auth = new AuthPage(page);

    await auth.signIn(E2E_USER.email, "definitely-not-the-password");

    await expect(page).toHaveURL(/error_code=/);
    await expect(auth.errorBanner).toBeVisible();
    await expect(auth.passwordInput).toBeVisible();
  });
});
