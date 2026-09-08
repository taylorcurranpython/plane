/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { describe, expect, it } from "vitest";
import {
  hasInjectionRiskChars,
  validateCompanyName,
  validateDisplayName,
  validatePersonName,
  validateSlug,
  validateWorkspaceName,
} from "./validation";

describe("hasInjectionRiskChars", () => {
  it("flags injection-risk characters", () => {
    expect(hasInjectionRiskChars("Hello World")).toBe(false);
    for (const ch of ["<", ">", "'", '"', "{", "}", "[", "]", "*", "^", "!", "#", "%"]) {
      expect(hasInjectionRiskChars(`a${ch}b`)).toBe(true);
    }
  });
});

describe("validatePersonName", () => {
  it("accepts international names with hyphens", () => {
    expect(validatePersonName("John")).toBe(true);
    expect(validatePersonName("Jean-Paul")).toBe(true);
    expect(validatePersonName("José Müller")).toBe(true);
    expect(validatePersonName("李明")).toBe(true);
  });

  it("returns an error message for invalid input", () => {
    expect(validatePersonName("")).toBe("Name is required");
    expect(validatePersonName("   ")).toBe("Name is required");
    expect(validatePersonName("a".repeat(51))).toBe("Name must be 50 characters or less");
    expect(validatePersonName("John<script>")).toMatch(/cannot contain special characters/);
    // apostrophes are in the injection-risk blocklist, so they are rejected before the name regex runs
    expect(validatePersonName("O'Brien")).toMatch(/cannot contain special characters/);
    expect(validatePersonName("John123")).toMatch(/can only contain letters/);
  });
});

describe("validateDisplayName", () => {
  it("is optional", () => {
    expect(validateDisplayName("")).toBe(true);
  });

  it("accepts letters, numbers, underscores, periods and hyphens", () => {
    expect(validateDisplayName("john_doe")).toBe(true);
    expect(validateDisplayName("john.doe-123")).toBe(true);
    expect(validateDisplayName("josé_123")).toBe(true);
  });

  it("rejects spaces, long values and risky characters", () => {
    expect(validateDisplayName("john doe")).toMatch(/can only contain/);
    expect(validateDisplayName("a".repeat(51))).toBe("Display name must be 50 characters or less");
    expect(validateDisplayName("john<>doe")).toMatch(/cannot contain special characters/);
  });
});

describe("validateCompanyName", () => {
  it("is optional unless required", () => {
    expect(validateCompanyName("")).toBe(true);
    expect(validateCompanyName("", true)).toBe("Company name is required");
  });

  it("accepts valid names", () => {
    expect(validateCompanyName("Acme Corp")).toBe(true);
    expect(validateCompanyName("Acme_Corp-123")).toBe(true);
    expect(validateCompanyName("Société Générale")).toBe(true);
  });

  it("rejects invalid names", () => {
    expect(validateCompanyName("a".repeat(81))).toBe("Company name must be 80 characters or less");
    expect(validateCompanyName("Acme{Corp}")).toMatch(/cannot contain special characters/);
    expect(validateCompanyName("Acme.Corp")).toMatch(/can only contain/);
    expect(validateCompanyName("-_________-")).toBe("Company name must contain at least one letter or number");
  });
});

describe("validateWorkspaceName", () => {
  it("mirrors company name validation with workspace messaging", () => {
    expect(validateWorkspaceName("")).toBe(true);
    expect(validateWorkspaceName("", true)).toBe("Workspace name is required");
    expect(validateWorkspaceName("My Workspace")).toBe(true);
    expect(validateWorkspaceName("a".repeat(81))).toBe("Workspace name must be 80 characters or less");
    expect(validateWorkspaceName("Bad<name>")).toMatch(/cannot contain special characters/);
    expect(validateWorkspaceName("Bad.name")).toMatch(/can only contain/);
    expect(validateWorkspaceName("___")).toBe("Workspace name must contain at least one letter or number");
  });
});

describe("validateSlug", () => {
  it("accepts URL-safe identifiers", () => {
    expect(validateSlug("my-workspace")).toBe(true);
    expect(validateSlug("my_workspace_123")).toBe(true);
    expect(validateSlug("josé-workspace")).toBe(true);
  });

  it("rejects invalid slugs", () => {
    expect(validateSlug("")).toBe("Slug is required");
    expect(validateSlug("a".repeat(49))).toBe("Slug must be 48 characters or less");
    expect(validateSlug("my workspace")).toMatch(/can only contain/);
    expect(validateSlug("my#slug")).toMatch(/cannot contain special characters/);
  });
});
