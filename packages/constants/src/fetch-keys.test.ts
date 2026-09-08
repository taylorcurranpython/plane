/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { describe, expect, it } from "vitest";
import {
  CYCLE_ISSUES_WITH_PARAMS,
  ISSUE_DETAILS,
  USER_ACTIVITY,
  USER_PROFILE_ACTIVITY,
  WORKSPACE_ACTIVE_CYCLES_LIST,
  WORKSPACE_MEMBERS,
} from "./fetch-keys";

describe("fetch keys", () => {
  it("upper-cases workspace slugs", () => {
    expect(WORKSPACE_MEMBERS("my-team")).toBe("WORKSPACE_MEMBERS_MY-TEAM");
    expect(ISSUE_DETAILS("abc")).toBe("ISSUE_DETAILS_ABC");
    expect(WORKSPACE_ACTIVE_CYCLES_LIST("ws", "c1", "10")).toBe("WORKSPACE_ACTIVE_CYCLES_LIST_WS_C1_10");
  });

  it("embeds cursors for paginated keys", () => {
    expect(USER_ACTIVITY({ cursor: "10:0:0" })).toBe("USER_ACTIVITY_10:0:0");
    expect(USER_ACTIVITY({})).toBe("USER_ACTIVITY_undefined");
    expect(USER_PROFILE_ACTIVITY("ws", "u1", { cursor: "1" })).toBe("USER_WORKSPACE_PROFILE_ACTIVITY_WS_U1_1");
  });

  describe("CYCLE_ISSUES_WITH_PARAMS", () => {
    it("omits the params segment when params are missing", () => {
      expect(CYCLE_ISSUES_WITH_PARAMS("cycle")).toBe("CYCLE_ISSUES_WITH_PARAMS_CYCLE");
    });

    it("produces a stable key regardless of filter value order", () => {
      const a = CYCLE_ISSUES_WITH_PARAMS("cycle", { state: "s2,s1", priority: "high,low", layout: "list" });
      const b = CYCLE_ISSUES_WITH_PARAMS("cycle", { state: "s1,s2", priority: "low,high", layout: "list" });
      expect(a).toBe(b);
      expect(a.startsWith("CYCLE_ISSUES_WITH_PARAMS_CYCLE_LIST_")).toBe(true);
      expect(a).toContain("S1_S2");
      expect(a).toContain("HIGH_LOW");
    });

    it("changes when filters change", () => {
      const a = CYCLE_ISSUES_WITH_PARAMS("cycle", { group_by: "state", order_by: "-created_at" });
      const b = CYCLE_ISSUES_WITH_PARAMS("cycle", { group_by: "priority", order_by: "-created_at" });
      expect(a).not.toBe(b);
      expect(a).toContain("_STATE_-CREATED_AT_");
      expect(a).toContain("_NULL_"); // type defaults to NULL
    });
  });
});
