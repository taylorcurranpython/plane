/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { describe, expect, it } from "vitest";
import type { IIssueLabelTree } from "@plane/types";
import {
  buildTree,
  checkDuplicates,
  checkIfArraysHaveSameElements,
  convertStringArrayToBooleanObject,
  findStringWithMostCharacters,
  getValidKeysFromObject,
  groupBy,
  groupByField,
  orderArrayBy,
  sortByCurrentUserThenSelected,
  sortBySelectedFirst,
} from "./array";

describe("groupBy", () => {
  it("groups items by a top-level key", () => {
    const items = [
      { type: "A", value: 1 },
      { type: "B", value: 2 },
      { type: "A", value: 3 },
    ];
    expect(groupBy(items, "type")).toEqual({
      A: [
        { type: "A", value: 1 },
        { type: "A", value: 3 },
      ],
      B: [{ type: "B", value: 2 }],
    });
  });

  it("supports dot notation and falls back to None for missing keys", () => {
    const items = [{ meta: { kind: "x" } }, { meta: {} }];
    expect(groupBy(items, "meta.kind")).toEqual({
      x: [{ meta: { kind: "x" } }],
      None: [{ meta: {} }],
    });
  });
});

describe("orderArrayBy", () => {
  const items = [{ value: 2 }, { value: 1 }, { value: 3 }];

  it("orders ascending by default and does not mutate the input", () => {
    const result = orderArrayBy(items, "value");
    expect(result).toEqual([{ value: 1 }, { value: 2 }, { value: 3 }]);
    expect(items[0]).toEqual({ value: 2 });
  });

  it("orders descending when asked or when the key is prefixed with -", () => {
    expect(orderArrayBy(items, "value", "descending")).toEqual([{ value: 3 }, { value: 2 }, { value: 1 }]);
    expect(orderArrayBy(items, "-value")).toEqual([{ value: 3 }, { value: 2 }, { value: 1 }]);
  });

  it("returns an empty array for invalid input", () => {
    expect(orderArrayBy([], "value")).toEqual([]);
    expect(orderArrayBy(null as unknown as [], "value")).toEqual([]);
  });
});

describe("checkDuplicates", () => {
  it("detects duplicates", () => {
    expect(checkDuplicates([1, 2, 2, 3])).toBe(true);
    expect(checkDuplicates([1, 2, 3])).toBe(false);
    expect(checkDuplicates([])).toBe(false);
  });
});

describe("findStringWithMostCharacters", () => {
  it("returns the longest string", () => {
    expect(findStringWithMostCharacters(["a", "bb", "ccc"])).toBe("ccc");
  });

  it("returns an empty string for empty input", () => {
    expect(findStringWithMostCharacters([])).toBe("");
  });
});

describe("checkIfArraysHaveSameElements", () => {
  it("ignores order", () => {
    expect(checkIfArraysHaveSameElements([1, 2], [2, 1])).toBe(true);
    expect(checkIfArraysHaveSameElements([1, 2], [1, 3])).toBe(false);
  });

  it("handles empty and null inputs", () => {
    expect(checkIfArraysHaveSameElements([], [])).toBe(true);
    expect(checkIfArraysHaveSameElements(null, [])).toBe(false);
    expect(checkIfArraysHaveSameElements([1], [1, 1])).toBe(false);
  });
});

describe("groupByField", () => {
  it("groups by a typed field", () => {
    const items = [
      { type: "A", value: 1 },
      { type: "B", value: 2 },
    ];
    expect(groupByField(items, "type")).toEqual({
      A: [{ type: "A", value: 1 }],
      B: [{ type: "B", value: 2 }],
    });
  });
});

describe("buildTree", () => {
  it("nests children under their parent", () => {
    const labels = [
      { id: "root", parent: null },
      { id: "child", parent: "root" },
      { id: "grandchild", parent: "child" },
    ];
    const tree = buildTree(labels as never);
    expect(tree).toHaveLength(1);
    expect(tree[0].id).toBe("root");
    expect(tree[0].children?.[0].id).toBe("child");
    const child = tree[0].children?.[0] as IIssueLabelTree;
    expect(child.children?.[0].id).toBe("grandchild");
  });
});

describe("getValidKeysFromObject", () => {
  it("returns keys with truthy values", () => {
    expect(getValidKeysFromObject({ a: 1, b: 0, c: null, d: "x" })).toEqual(["a", "d"]);
  });

  it("returns an empty array for non-objects", () => {
    expect(getValidKeysFromObject(null)).toEqual([]);
    expect(getValidKeysFromObject([])).toEqual([]);
    expect(getValidKeysFromObject({})).toEqual([]);
  });
});

describe("convertStringArrayToBooleanObject", () => {
  it("maps strings to true", () => {
    expect(convertStringArrayToBooleanObject(["a", "b"])).toEqual({ a: true, b: true });
  });
});

describe("sortBySelectedFirst", () => {
  const options = [{ value: "1" }, { value: "2" }, { value: null }, { value: "3" }];

  it("moves selected items to the front while preserving relative order", () => {
    expect(sortBySelectedFirst(options, ["3", "2"])).toEqual([
      { value: "2" },
      { value: "3" },
      { value: "1" },
      { value: null },
    ]);
  });

  it("accepts a single selected value", () => {
    expect(sortBySelectedFirst(options, "3")?.[0]).toEqual({ value: "3" });
  });

  it("returns the input unchanged when nothing is selected", () => {
    expect(sortBySelectedFirst(options, null)).toBe(options);
    expect(sortBySelectedFirst(undefined, ["1"])).toBeUndefined();
  });
});

describe("sortByCurrentUserThenSelected", () => {
  const options = [{ value: "user1" }, { value: "user2" }, { value: "user3" }];

  it("puts the current user first, then selected, then the rest", () => {
    expect(sortByCurrentUserThenSelected(options, ["user2"], "user3")).toEqual([
      { value: "user3" },
      { value: "user2" },
      { value: "user1" },
    ]);
  });

  it("falls back to selected-first ordering without a current user", () => {
    expect(sortByCurrentUserThenSelected(options, "user2", undefined)).toEqual([
      { value: "user2" },
      { value: "user1" },
      { value: "user3" },
    ]);
  });
});
