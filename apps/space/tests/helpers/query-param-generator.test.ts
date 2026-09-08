/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { describe, expect, it } from "vitest";
import { queryParamGenerator } from "@/helpers/query-param-generator";
import {
  addSpaceIfCamelCase,
  capitalizeFirstLetter,
  checkEmailValidity,
  checkURLValidity,
} from "@/helpers/string.helper";

describe("queryParamGenerator", () => {
  it("splits comma separated strings and keeps arrays/primitives", () => {
    const { query, queryParam } = queryParamGenerator({
      state: "a,b",
      labels: ["x", "y"],
      page: 2,
      archived: true,
    });
    expect(query).toEqual({ state: ["a", "b"], labels: ["x", "y"], page: 2, archived: true });
    expect(queryParam).toBe("state=a%2Cb&labels=x%2Cy&page=2&archived=true");
  });

  it("drops empty, null and undefined values", () => {
    const { query, queryParam } = queryParamGenerator({ a: "", b: [], c: null, d: undefined });
    expect(query).toEqual({});
    expect(queryParam).toBe("");
  });
});

describe("string helpers", () => {
  it("adds spaces to camelCase and capitalizes", () => {
    expect(addSpaceIfCamelCase("targetDate")).toBe("target Date");
    expect(capitalizeFirstLetter("plane")).toBe("Plane");
  });

  it("validates emails and URLs", () => {
    expect(checkEmailValidity("example@plane.so")).toBe(true);
    expect(checkEmailValidity("hello world")).toBe(false);
    expect(checkEmailValidity("")).toBe(false);
    expect(checkURLValidity("https://example.com/path?q=1#frag")).toBe(true);
    expect(checkURLValidity("example.com")).toBe(true);
    expect(checkURLValidity("example")).toBe(false);
  });
});
