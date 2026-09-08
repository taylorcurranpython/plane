/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { getValueFromLocalStorage, setValueIntoLocalStorage, useLocalStorage } from "./use-local-storage";

describe("localStorage helpers", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("returns the default when the key is missing", () => {
    expect(getValueFromLocalStorage("missing", "fallback")).toBe("fallback");
  });

  it("round-trips JSON values", () => {
    expect(setValueIntoLocalStorage("key", { a: 1 })).toBe(true);
    expect(getValueFromLocalStorage("key", null)).toEqual({ a: 1 });
  });

  it("drops corrupt entries and returns the default", () => {
    window.localStorage.setItem("bad", "{not json");
    expect(getValueFromLocalStorage("bad", "fallback")).toBe("fallback");
    expect(window.localStorage.getItem("bad")).toBeNull();
  });
});

describe("useLocalStorage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("initialises from storage or the initial value", () => {
    window.localStorage.setItem("theme", JSON.stringify("dark"));
    const { result } = renderHook(() => useLocalStorage("theme", "light"));
    expect(result.current.storedValue).toBe("dark");

    const fresh = renderHook(() => useLocalStorage("other", "light"));
    expect(fresh.result.current.storedValue).toBe("light");
  });

  it("setValue persists and clearValue removes then falls back to the initial value", () => {
    const { result } = renderHook(() => useLocalStorage<string | null>("theme", "light"));

    act(() => result.current.setValue("dark"));
    expect(result.current.storedValue).toBe("dark");
    expect(window.localStorage.getItem("theme")).toBe(JSON.stringify("dark"));

    act(() => result.current.clearValue());
    expect(window.localStorage.getItem("theme")).toBeNull();
    // the storage event re-hydrates the hook, so it settles on the initial value
    expect(result.current.storedValue).toBe("light");
  });

  it("keeps multiple hook instances for the same key in sync", () => {
    const first = renderHook(() => useLocalStorage("shared", 0));
    const second = renderHook(() => useLocalStorage("shared", 0));

    act(() => first.result.current.setValue(42));
    expect(second.result.current.storedValue).toBe(42);
  });
});
