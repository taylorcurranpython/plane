/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { describe, expect, it } from "vitest";
import {
  cn,
  convertRemToPixel,
  extractIds,
  filterValidIds,
  getSupportEmail,
  isComplete,
  isValidId,
  partitionValidIds,
} from "./common";
import { getProgress } from "./math";
import { convertHexEmojiToDecimal, emojiCodeToUnicode, groupReactions } from "./emoji";
import { calculateTotalFilters } from "./filter";

describe("cn", () => {
  it("merges class names and resolves tailwind conflicts", () => {
    expect(cn("px-2", "py-1", { hidden: false, block: true })).toBe("px-2 py-1 block");
    expect(cn("px-2", "px-4")).toBe("px-4");
  });

  it("keeps custom typography and text colours from clobbering each other", () => {
    expect(cn("text-13", "text-primary")).toBe("text-13 text-primary");
    expect(cn("text-13", "text-14")).toBe("text-14");
  });
});

describe("id helpers", () => {
  const items = [{ id: "a" }, { id: "b" }];

  it("extractIds", () => {
    expect(extractIds(items)).toEqual(["a", "b"]);
  });

  it("isValidId", () => {
    expect(isValidId("a", ["a", "b"])).toBe(true);
    expect(isValidId("z", ["a", "b"])).toBe(false);
    expect(isValidId(null, ["a"])).toBe(false);
  });

  it("filterValidIds / partitionValidIds", () => {
    expect(filterValidIds(["a", "z"], ["a", "b"])).toEqual(["a"]);
    expect(partitionValidIds(["a", "z", "b"], ["a", "b"])).toEqual({ valid: ["a", "b"], invalid: ["z"] });
  });
});

describe("isComplete", () => {
  it("narrows non-empty objects", () => {
    expect(isComplete({ a: 1 })).toBe(true);
    expect(isComplete({})).toBe(false);
    expect(isComplete(null as never)).toBe(false);
    expect(isComplete("str" as never)).toBe(false);
  });
});

describe("misc", () => {
  it("getSupportEmail echoes the default", () => {
    expect(getSupportEmail()).toBe("");
    expect(getSupportEmail("help@plane.so")).toBe("help@plane.so");
  });

  it("convertRemToPixel uses the 0.9 scale", () => {
    expect(convertRemToPixel(1)).toBeCloseTo(14.4);
  });

  it("getProgress rounds percentages and guards zero totals", () => {
    expect(getProgress(1, 3)).toBe(33);
    expect(getProgress(undefined, 3)).toBe(0);
    expect(getProgress(3, 0)).toBe(0);
    expect(getProgress(3, undefined)).toBe(0);
  });
});

describe("emoji", () => {
  it("converts between hex and decimal emoji codes", () => {
    expect(convertHexEmojiToDecimal("1f600")).toBe("128512");
    expect(convertHexEmojiToDecimal("1f1e6-1f1e8")).toBe("127462-127464");
    expect(convertHexEmojiToDecimal("")).toBe("");
    expect(emojiCodeToUnicode("128512")).toBe("1f600");
    expect(emojiCodeToUnicode("127462-127464")).toBe("1f1e6-1f1e8");
    expect(emojiCodeToUnicode("")).toBe("");
  });

  it("groups reactions by key", () => {
    const reactions = [
      { reaction: "👍", id: 1 },
      { reaction: "👎", id: 2 },
      { reaction: "👍", id: 3 },
    ];
    const grouped = groupReactions(reactions, "reaction");
    expect(grouped["👍"]).toHaveLength(2);
    expect(grouped["👎"]).toHaveLength(1);
  });
});

describe("calculateTotalFilters", () => {
  it("counts array lengths and truthy booleans", () => {
    expect(calculateTotalFilters({ a: ["x", "y"], b: true, c: false, d: null, e: "str" })).toBe(3);
    expect(calculateTotalFilters({})).toBe(0);
    expect(calculateTotalFilters(null)).toBe(0);
  });
});
