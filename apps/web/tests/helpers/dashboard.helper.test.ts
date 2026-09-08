/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { describe, expect, it } from "vitest";
import { EDurationFilters } from "@plane/constants";
import { renderFormattedPayloadDate } from "@plane/utils";
import {
  getCustomDates,
  getDurationFilterDropdownLabel,
  getRedirectionFilters,
  getTabKey,
} from "@/helpers/dashboard.helper";

describe("dashboard helpers", () => {
  it("getCustomDates returns today range and custom dates", () => {
    const today = renderFormattedPayloadDate(new Date());
    expect(getCustomDates(EDurationFilters.NONE, [])).toBe("");
    expect(getCustomDates(EDurationFilters.TODAY, [])).toBe(`${today};after,${today};before`);
    expect(getCustomDates(EDurationFilters.CUSTOM, ["a;after", "b;before"])).toBe("a;after,b;before");
  });

  it("getRedirectionFilters maps list types to query strings", () => {
    const today = renderFormattedPayloadDate(new Date());
    expect(getRedirectionFilters("pending")).toBe("?state_group=backlog,unstarted,started");
    expect(getRedirectionFilters("upcoming")).toBe(`?target_date=${today};after`);
    expect(getRedirectionFilters("overdue")).toBe(`?target_date=${today};before`);
    expect(getRedirectionFilters("completed")).toBe("?state_group=completed");
  });

  it("getTabKey normalises the active tab against the duration", () => {
    expect(getTabKey(EDurationFilters.NONE, undefined)).toBe("completed");
    expect(getTabKey(EDurationFilters.NONE, "completed")).toBe("completed");
    expect(getTabKey(EDurationFilters.NONE, "upcoming")).toBe("pending");
    expect(getTabKey(EDurationFilters.TODAY, "overdue")).toBe("overdue");
    expect(getTabKey(EDurationFilters.TODAY, "pending")).toBe("upcoming");
  });

  it("getDurationFilterDropdownLabel uses option labels and custom ranges", () => {
    expect(getDurationFilterDropdownLabel(EDurationFilters.NONE, [])).toBe("All time");
    expect(getDurationFilterDropdownLabel(EDurationFilters.CUSTOM, ["2024-01-05;after"])).toMatch(/^After /);
    expect(getDurationFilterDropdownLabel(EDurationFilters.CUSTOM, ["2024-01-05;before"])).toMatch(/^Before /);
    expect(getDurationFilterDropdownLabel(EDurationFilters.CUSTOM, ["2024-01-05;after", "2024-01-10;before"])).toMatch(
      / - /
    );
    expect(getDurationFilterDropdownLabel(EDurationFilters.CUSTOM, [])).toBe("");
  });
});
