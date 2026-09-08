/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { observer } from "mobx-react";
import { beforeEach, describe, expect, it } from "vitest";
import { useTheme } from "@/hooks/store";
import { createTestStore, renderWithProviders } from "../test-utils";

const ThemeToggle = observer(function ThemeToggle() {
  const theme = useTheme();
  return (
    <button type="button" onClick={() => theme.setTheme(theme.theme === "dark" ? "light" : "dark")}>
      {theme.theme ?? "unset"}
    </button>
  );
});

describe("admin ThemeStore", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("hydrates and persists theme changes", async () => {
    const store = createTestStore();
    store.theme.hydrate("dark");
    expect(store.theme.theme).toBe("dark");

    await store.theme.setTheme("light");
    expect(store.theme.theme).toBe("light");
    expect(localStorage.getItem("theme")).toBe("light");
  });

  it("toggles sidebar and new-user popup", () => {
    const store = createTestStore();
    store.theme.toggleSidebar(true);
    expect(store.theme.isSidebarCollapsed).toBe(true);
    expect(localStorage.getItem("god_mode_sidebar_collapsed")).toBe("true");

    store.theme.toggleNewUserPopup();
    expect(store.theme.isNewUserPopup).toBe(true);
  });

  it("re-renders observers through the store context", async () => {
    const store = createTestStore();
    renderWithProviders(<ThemeToggle />, { store });

    expect(screen.getByRole("button")).toHaveTextContent("unset");
    await userEvent.click(screen.getByRole("button"));
    expect(screen.getByRole("button")).toHaveTextContent("dark");
    await userEvent.click(screen.getByRole("button"));
    expect(screen.getByRole("button")).toHaveTextContent("light");
  });
});
