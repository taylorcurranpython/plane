/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import type { RenderOptions, RenderResult } from "@testing-library/react";
import { render } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { MemoryRouter } from "react-router";
import { StoreContext } from "@/providers/store-context";
import { RootStore } from "@/store/root.store";

type TRenderOptions = Omit<RenderOptions, "wrapper"> & {
  store?: RootStore;
  initialEntries?: string[];
};

export const createTestStore = () => new RootStore();

/**
 * Renders a component inside the admin StoreContext and a MemoryRouter.
 * Pass `store` to seed state before rendering.
 */
export const renderWithProviders = (
  ui: ReactElement,
  options: TRenderOptions = {}
): RenderResult & { store: RootStore } => {
  const { store = createTestStore(), initialEntries = ["/"], ...renderOptions } = options;

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <StoreContext.Provider value={store}>
        <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
      </StoreContext.Provider>
    );
  }

  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
};
