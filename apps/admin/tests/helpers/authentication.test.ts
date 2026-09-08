/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { describe, expect, it } from "vitest";
import type { IFormattedInstanceConfiguration, TInstanceAuthenticationModes } from "@plane/types";
import { canDisableAuthMethod } from "@/helpers/authentication";

const modes = [
  { key: "email", enabledConfigKey: "ENABLE_EMAIL_PASSWORD" },
  { key: "google", enabledConfigKey: "IS_GOOGLE_ENABLED" },
  { key: "github", enabledConfigKey: "IS_GITHUB_ENABLED" },
] as unknown as TInstanceAuthenticationModes[];

const config = (overrides: Record<string, string>) => overrides as unknown as IFormattedInstanceConfiguration;

describe("canDisableAuthMethod", () => {
  it("prevents disabling the only enabled method", () => {
    expect(canDisableAuthMethod("ENABLE_EMAIL_PASSWORD", modes, config({ ENABLE_EMAIL_PASSWORD: "1" }))).toBe(false);
  });

  it("allows disabling when another method is enabled", () => {
    expect(
      canDisableAuthMethod(
        "ENABLE_EMAIL_PASSWORD",
        modes,
        config({ ENABLE_EMAIL_PASSWORD: "1", IS_GOOGLE_ENABLED: "1" })
      )
    ).toBe(true);
  });

  it("allows toggling a method that is currently disabled", () => {
    expect(canDisableAuthMethod("IS_GITHUB_ENABLED", modes, config({ ENABLE_EMAIL_PASSWORD: "1" }))).toBe(true);
  });

  it("treats a missing configuration as nothing enabled", () => {
    expect(canDisableAuthMethod("ENABLE_EMAIL_PASSWORD", modes, undefined)).toBe(true);
  });
});
