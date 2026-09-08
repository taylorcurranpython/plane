/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { describe, expect, it } from "vitest";
import type { TWorkItemFilterExpression } from "@plane/types";
import { workItemFiltersAdapter } from "./adapter";

describe("workItemFiltersAdapter", () => {
  it("returns null for empty external filters", () => {
    expect(workItemFiltersAdapter.toInternal(undefined as unknown as TWorkItemFilterExpression)).toBeNull();
    expect(workItemFiltersAdapter.toInternal({} as TWorkItemFilterExpression)).toBeNull();
  });

  it("parses a single condition and splits comma separated `in` values", () => {
    const internal = workItemFiltersAdapter.toInternal({ state_id__in: "a, b,,c" } as TWorkItemFilterExpression);
    expect(internal).toMatchObject({
      type: "condition",
      property: "state_id",
      operator: "in",
      value: ["a", "b", "c"],
    });
  });

  it("keeps single-valued `in` filters as a scalar", () => {
    const internal = workItemFiltersAdapter.toInternal({ priority__in: "urgent" } as TWorkItemFilterExpression);
    expect(internal).toMatchObject({ property: "priority", operator: "in", value: "urgent" });
  });

  it("parses AND groups recursively", () => {
    const internal = workItemFiltersAdapter.toInternal({
      and: [{ priority__exact: "high" }, { label_id__in: "l1,l2" }],
    } as TWorkItemFilterExpression);
    expect(internal).toMatchObject({
      type: "group",
      logicalOperator: "and",
      children: [
        { property: "priority", operator: "exact", value: "high" },
        { property: "label_id", operator: "in", value: ["l1", "l2"] },
      ],
    });
  });

  it("round-trips through toExternal", () => {
    const external = { and: [{ priority__exact: "high" }, { label_id__in: "l1,l2" }] } as TWorkItemFilterExpression;
    const internal = workItemFiltersAdapter.toInternal(external);
    expect(internal).not.toBeNull();
    expect(workItemFiltersAdapter.toExternal(internal!)).toEqual(external);
  });

  it("toExternal of null yields an empty expression", () => {
    expect(workItemFiltersAdapter.toExternal(null as never)).toEqual({});
  });
});
