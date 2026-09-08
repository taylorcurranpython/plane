/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { describe, expect, it, vi } from "vitest";
import type { TWorkItemFilterExpression, TWorkItemFilterProperty } from "@plane/types";
import { COLLECTION_OPERATOR, EQUALITY_OPERATOR, LOGICAL_OPERATOR } from "@plane/types";
import { workItemFiltersAdapter } from "../work-item-filters/adapter";
import { FilterInstance } from "./filter";

type TInstance = FilterInstance<TWorkItemFilterProperty, TWorkItemFilterExpression>;

const createInstance = (
  initialExpression?: TWorkItemFilterExpression,
  onExpressionChange = vi.fn()
): { instance: TInstance; onExpressionChange: ReturnType<typeof vi.fn> } => {
  const instance = new FilterInstance<TWorkItemFilterProperty, TWorkItemFilterExpression>({
    adapter: workItemFiltersAdapter,
    initialExpression,
    onExpressionChange,
  });
  return { instance, onExpressionChange };
};

describe("FilterInstance", () => {
  it("starts empty when no initial expression is given", () => {
    const { instance } = createInstance();
    expect(instance.expression).toBeNull();
    expect(instance.hasActiveFilters).toBe(false);
    expect(instance.hasChanges).toBe(false);
    expect(instance.allConditions).toEqual([]);
  });

  it("hydrates from an external expression", () => {
    const { instance } = createInstance({ priority__exact: "high" } as TWorkItemFilterExpression);
    expect(instance.hasActiveFilters).toBe(true);
    expect(instance.hasChanges).toBe(false);
    expect(instance.allConditions).toHaveLength(1);
    expect(instance.allConditions[0]).toMatchObject({ property: "priority", operator: "exact", value: "high" });
  });

  it("addCondition notifies with the external expression when the value is valid", () => {
    const { instance, onExpressionChange } = createInstance();
    instance.addCondition(
      LOGICAL_OPERATOR.AND,
      {
        property: "state_id",
        operator: COLLECTION_OPERATOR.IN,
        value: ["s1", "s2"],
      },
      false
    );

    expect(instance.hasActiveFilters).toBe(true);
    expect(instance.hasChanges).toBe(true);
    expect(onExpressionChange).toHaveBeenCalledTimes(1);
    expect(onExpressionChange).toHaveBeenCalledWith({ state_id__in: "s1,s2" });
  });

  it("addCondition with an empty value does not notify", () => {
    const { instance, onExpressionChange } = createInstance();
    instance.addCondition(
      LOGICAL_OPERATOR.AND,
      {
        property: "state_id",
        operator: COLLECTION_OPERATOR.IN,
        value: [],
      },
      false
    );
    expect(instance.allConditions).toHaveLength(1);
    expect(instance.hasActiveFilters).toBe(false);
    expect(onExpressionChange).not.toHaveBeenCalled();
  });

  it("updateConditionValue and removeCondition mutate the tree and notify", () => {
    const { instance, onExpressionChange } = createInstance({ priority__exact: "high" } as TWorkItemFilterExpression);
    const condition = instance.findFirstConditionByPropertyAndOperator("priority", EQUALITY_OPERATOR.EXACT);
    expect(condition).toBeDefined();

    instance.updateConditionValue(condition!.id, "low");
    expect(onExpressionChange).toHaveBeenLastCalledWith({ priority__exact: "low" });

    instance.removeCondition(condition!.id);
    expect(instance.expression).toBeNull();
    expect(instance.hasActiveFilters).toBe(false);
    expect(onExpressionChange).toHaveBeenLastCalledWith({});
  });

  it("resetExpression replaces the tree and can reset the baseline", () => {
    const { instance } = createInstance({ priority__exact: "high" } as TWorkItemFilterExpression);
    instance.resetExpression({ priority__exact: "low" } as TWorkItemFilterExpression, false);
    expect(instance.hasChanges).toBe(true);
    expect(instance.allConditions[0]).toMatchObject({ value: "low" });

    instance.resetExpression({ priority__exact: "low" } as TWorkItemFilterExpression);
    expect(instance.hasChanges).toBe(false);
  });

  it("toggleVisibility flips and sets explicitly", () => {
    const { instance } = createInstance();
    const initial = instance.isVisible;
    instance.toggleVisibility();
    expect(instance.isVisible).toBe(!initial);
    instance.toggleVisibility(true);
    expect(instance.isVisible).toBe(true);
  });

  it("clearFilters respects the disabled option and invokes the callback", async () => {
    const { instance, onExpressionChange } = createInstance({ priority__exact: "high" } as TWorkItemFilterExpression);
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    const onFilterClear = vi.fn();
    instance.updateExpressionOptions({ clearFilterOptions: { isDisabled: true, onFilterClear } });
    expect(instance.canClearFilters).toBe(false);
    await instance.clearFilters();
    expect(instance.expression).not.toBeNull();
    expect(warn).toHaveBeenCalled();

    instance.updateExpressionOptions({ clearFilterOptions: { isDisabled: false, onFilterClear } });
    expect(instance.canClearFilters).toBe(true);
    await instance.clearFilters();
    expect(onFilterClear).toHaveBeenCalled();
    expect(instance.expression).toBeNull();
    expect(onExpressionChange).toHaveBeenLastCalledWith({});

    warn.mockRestore();
  });

  it("canClearFilters is false for an empty expression", () => {
    const { instance } = createInstance();
    expect(instance.canClearFilters).toBe(false);
  });

  it("canSaveView / canUpdateView follow their options", () => {
    const { instance } = createInstance({ priority__exact: "high" } as TWorkItemFilterExpression);
    expect(instance.canSaveView).toBe(false);
    expect(instance.canUpdateView).toBe(false);

    instance.updateExpressionOptions({
      saveViewOptions: { onViewSave: vi.fn() },
      updateViewOptions: { onViewUpdate: vi.fn() },
    });
    expect(instance.canSaveView).toBe(true);
    expect(instance.canUpdateView).toBe(false);

    instance.updateConditionValue(instance.allConditions[0].id, "low");
    expect(instance.canUpdateView).toBe(true);
  });
});
