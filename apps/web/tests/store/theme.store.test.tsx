/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { observer } from "mobx-react";
import { beforeEach, describe, expect, it } from "vitest";
import { useAppTheme } from "@/hooks/store/use-app-theme";
import type { RootStore } from "@/store/root.store";
import { ThemeStore } from "@/store/theme.store";
import { renderWithProviders } from "../test-utils";

const SidebarToggle = observer(function SidebarToggle() {
  const { sidebarCollapsed, toggleSidebar } = useAppTheme();
  return (
    <button type="button" onClick={() => toggleSidebar()}>
      {sidebarCollapsed ? "collapsed" : "expanded"}
    </button>
  );
});

describe("web ThemeStore", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("toggles and persists the sidebar state", () => {
    const theme = new ThemeStore();
    theme.toggleSidebar();
    expect(theme.sidebarCollapsed).toBe(true);
    expect(localStorage.getItem("app_sidebar_collapsed")).toBe("true");
    theme.toggleSidebar(false);
    expect(theme.sidebarCollapsed).toBe(false);
  });

  it("toggles peek and dropdown flags", () => {
    const theme = new ThemeStore();
    theme.toggleSidebarPeek();
    expect(theme.sidebarPeek).toBe(true);
    theme.toggleAnySidebarDropdown(true);
    expect(theme.isAnySidebarDropdownOpen).toBe(true);
    theme.toggleAnySidebarDropdown();
    expect(theme.isAnySidebarDropdownOpen).toBe(false);
  });

  it("drives observers through the store context", async () => {
    const theme = new ThemeStore();
    renderWithProviders(<SidebarToggle />, { store: { theme } as unknown as RootStore });

    expect(screen.getByRole("button")).toHaveTextContent("expanded");
    await userEvent.click(screen.getByRole("button"));
    expect(screen.getByRole("button")).toHaveTextContent("collapsed");
  });
});
