/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { test as setup, expect } from "@playwright/test";
import { AUTH_STATE_PATH, TEST_USER_PASSWORD } from "../support/env";
import { ensureInstanceIsSetUp } from "../support/instance";
import { AuthPage } from "../support/pages/auth.page";
import { OnboardingPage } from "../support/pages/onboarding.page";
import { uniqueSuffix, writeSession } from "../support/session";

/**
 * Runs once before every spec: makes sure the instance is configured, then
 * exercises the real sign-up + onboarding flow to produce an authenticated
 * browser state for the rest of the suite.
 */
setup("sign up a fresh user and complete onboarding", async ({ page }) => {
  setup.setTimeout(180_000);
  await ensureInstanceIsSetUp();

  const suffix = uniqueSuffix();
  const email = `e2e-${suffix}@plane.local`;
  const displayName = "Playwright Tester";
  const workspaceName = `E2E Space ${suffix}`;

  const auth = new AuthPage(page);
  await auth.signUp(email, TEST_USER_PASSWORD);

  const onboarding = new OnboardingPage(page);
  await onboarding.expectProfileStep();
  await onboarding.completeProfile(displayName);
  const workspaceSlug = await onboarding.createWorkspace(workspaceName);
  await onboarding.dismissProductTour();

  await expect(
    page.getByText(`Welcome to Plane, ${displayName}`).or(page.getByText(displayName).first())
  ).toBeVisible();

  writeSession({ email, password: TEST_USER_PASSWORD, displayName, workspaceName, workspaceSlug });
  await page.context().storageState({ path: AUTH_STATE_PATH });
});
