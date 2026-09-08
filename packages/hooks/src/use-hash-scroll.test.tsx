/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useHashScroll } from "./use-hash-scroll";

describe("useHashScroll", () => {
  let scrollIntoView: ReturnType<typeof vi.fn<Element["scrollIntoView"]>>;

  beforeEach(() => {
    vi.useFakeTimers();
    scrollIntoView = vi.fn();
    const target = document.createElement("div");
    target.id = "comment-1";
    target.scrollIntoView = scrollIntoView;
    document.body.appendChild(target);
  });

  afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = "";
    window.location.hash = "";
  });

  it("reports no match when the hash is empty", () => {
    const { result } = renderHook(() => useHashScroll({ elementId: "comment-1", pathname: "/" }));
    expect(result.current.isHashMatch).toBe(false);
    expect(result.current.hashIds).toEqual([]);
  });

  it("parses delimited ids and scrolls to a matching element after the delay", () => {
    window.location.hash = "#comment-1,comment-2|comment-3";
    const { result } = renderHook(() => useHashScroll({ elementId: "comment-1", pathname: "/", scrollDelay: 50 }));

    expect(result.current.hashIds).toEqual(["comment-1", "comment-2", "comment-3"]);
    expect(result.current.isHashMatch).toBe(true);
    expect(scrollIntoView).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(50);
    });
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: "smooth", block: "nearest" });
  });

  it("reacts to hashchange events", () => {
    const { result } = renderHook(() => useHashScroll({ elementId: "comment-1", pathname: "/" }));
    expect(result.current.isHashMatch).toBe(false);

    act(() => {
      window.location.hash = "#comment-1";
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    });
    expect(result.current.isHashMatch).toBe(true);
  });

  it("scrollToElement returns false when the element is missing", () => {
    const { result } = renderHook(() => useHashScroll({ elementId: "nope", pathname: "/" }));
    expect(result.current.scrollToElement()).toBe(false);
  });
});
