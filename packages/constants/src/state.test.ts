/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { describe, expect, it } from "vitest";
import {
  ARCHIVABLE_STATE_GROUPS,
  COMPLETED_STATE_GROUPS,
  PENDING_STATE_GROUPS,
  STATE_DISTRIBUTION,
  STATE_GROUPS,
} from "./state";
import { WORKSPACE_SIDEBAR_DYNAMIC_NAVIGATION_ITEMS, WORKSPACE_SIDEBAR_STATIC_NAVIGATION_ITEMS } from "./workspace";

describe("STATE_GROUPS", () => {
  it("keys match their entries", () => {
    for (const [key, group] of Object.entries(STATE_GROUPS)) {
      expect(group.key).toBe(key);
      expect(group.color).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });

  it("derived group lists partition the state groups", () => {
    const all = Object.keys(STATE_GROUPS);
    expect(ARCHIVABLE_STATE_GROUPS).toEqual(["completed", "cancelled"]);
    expect(COMPLETED_STATE_GROUPS).toEqual(["completed"]);
    expect([...PENDING_STATE_GROUPS, ...COMPLETED_STATE_GROUPS].toSorted()).toEqual(all.toSorted());
  });

  it("STATE_DISTRIBUTION uses matching issue/point field names", () => {
    for (const [key, entry] of Object.entries(STATE_DISTRIBUTION)) {
      expect(entry.key).toBe(key);
      expect(entry.issues).toBe(`${key}_issues`);
      expect(entry.points).toBe(`${key}_estimate_points`);
    }
  });
});

describe("workspace sidebar navigation highlight", () => {
  it("home and projects require an exact match", () => {
    expect(WORKSPACE_SIDEBAR_STATIC_NAVIGATION_ITEMS.home.highlight("/ws/", "/ws/")).toBe(true);
    expect(WORKSPACE_SIDEBAR_STATIC_NAVIGATION_ITEMS.home.highlight("/ws/projects/", "/ws/")).toBe(false);
    expect(WORKSPACE_SIDEBAR_STATIC_NAVIGATION_ITEMS.projects.highlight("/ws/projects/1/", "/ws/projects/")).toBe(
      false
    );
  });

  it("nested sections highlight on prefix match", () => {
    expect(
      WORKSPACE_SIDEBAR_STATIC_NAVIGATION_ITEMS.inbox.highlight("/ws/notifications/123", "/ws/notifications/")
    ).toBe(true);
    expect(
      WORKSPACE_SIDEBAR_DYNAMIC_NAVIGATION_ITEMS.views.highlight(
        "/ws/workspace-views/all-issues/",
        "/ws/workspace-views/all-issues/"
      )
    ).toBe(true);
    expect(WORKSPACE_SIDEBAR_DYNAMIC_NAVIGATION_ITEMS.analytics.highlight("/ws/", "/ws/analytics/")).toBe(false);
  });
});
