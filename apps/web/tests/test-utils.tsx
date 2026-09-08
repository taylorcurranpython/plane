/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import type { RenderOptions, RenderResult } from "@testing-library/react";
import { render } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { MemoryRouter } from "react-router";
import { StoreContext } from "@/lib/store-context";
import type { RootStore } from "@/store/root.store";

type TRenderOptions = Omit<RenderOptions, "wrapper"> & {
  /**
   * The web RootStore is heavy, so tests pass only the slices they need.
   * Cast a partial object to `RootStore` at the call site.
   */
  store: RootStore;
  initialEntries?: string[];
};

/**
 * Renders a component inside the web StoreContext and a MemoryRouter.
 */
export const renderWithProviders = (ui: ReactElement, options: TRenderOptions): RenderResult => {
  const { store, initialEntries = ["/"], ...renderOptions } = options;

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <StoreContext.Provider value={store}>
        <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
      </StoreContext.Provider>
    );
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};
