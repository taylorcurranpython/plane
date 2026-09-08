/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Collapsible } from "./collapsible";

describe("Collapsible", () => {
  it("is closed by default and toggles on click (uncontrolled)", async () => {
    render(
      <Collapsible title="More">
        <p>Hidden content</p>
      </Collapsible>
    );
    expect(screen.queryByText("Hidden content")).toBeNull();
    await userEvent.click(screen.getByRole("button", { name: "More" }));
    expect(screen.getByText("Hidden content")).toBeInTheDocument();
  });

  it("respects defaultOpen", () => {
    render(
      <Collapsible title="More" defaultOpen>
        <p>Visible content</p>
      </Collapsible>
    );
    expect(screen.getByText("Visible content")).toBeInTheDocument();
  });

  it("delegates to onToggle when controlled", async () => {
    const onToggle = vi.fn();
    const { rerender } = render(
      <Collapsible title="More" isOpen={false} onToggle={onToggle}>
        <p>Controlled content</p>
      </Collapsible>
    );
    await userEvent.click(screen.getByRole("button", { name: "More" }));
    expect(onToggle).toHaveBeenCalledTimes(1);
    expect(screen.queryByText("Controlled content")).toBeNull();

    rerender(
      <Collapsible title="More" isOpen onToggle={onToggle}>
        <p>Controlled content</p>
      </Collapsible>
    );
    expect(screen.getByText("Controlled content")).toBeInTheDocument();
  });
});
