/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { describe, expect, it } from "vitest";
import type { IssuePaginationOptions } from "@plane/types";
import { getPaginationParams } from "@/store/helpers/filter.helpers";

const baseOptions = { perPageCount: 50, canGroup: true } as unknown as IssuePaginationOptions;

describe("getPaginationParams", () => {
  it("builds a default cursor from per-page count", () => {
    expect(getPaginationParams({ priority: "high" }, baseOptions, undefined)).toEqual({
      priority: "high",
      cursor: "50:0:0",
      per_page: "50",
    });
  });

  it("prefers an explicit cursor and adds grouping/order options", () => {
    const params = getPaginationParams(
      undefined,
      { ...baseOptions, groupedBy: "state", orderBy: "-created_at" },
      "50:2:0"
    );
    expect(params).toMatchObject({ cursor: "50:2:0", group_by: "state_id", order_by: "-created_at" });
  });

  it("adds a target_date range when after/before are provided", () => {
    const params = getPaginationParams(
      undefined,
      { ...baseOptions, after: "2024-01-01", before: "2024-01-31" },
      undefined
    );
    expect(params.target_date).toBe("2024-01-01;after,2024-01-31;before");
  });

  it("replaces group_by with a filter when fetching a specific group", () => {
    const params = getPaginationParams(undefined, { ...baseOptions, groupedBy: "state" }, undefined, "state-1");
    expect(params.cursor).toBe("50:1:0");
    expect(params.group_by).toBeUndefined();
    expect(params.state).toBe("state-1");
  });

  it("replaces sub_group_by with a filter when fetching a specific sub group", () => {
    const params = getPaginationParams(
      undefined,
      { ...baseOptions, groupedBy: "state", subGroupedBy: "priority" },
      undefined,
      "state-1",
      "urgent"
    );
    expect(params.sub_group_by).toBeUndefined();
    expect(params.priority).toBe("urgent");
  });
});
