/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Button } from "./button";
import { getButtonStyling, getIconStyling } from "./helper";

describe("Button", () => {
  it("renders children with type=button by default", () => {
    render(<Button>Save</Button>);
    const button = screen.getByRole("button", { name: "Save" });
    expect(button).toHaveAttribute("type", "button");
    expect(button).toBeEnabled();
  });

  it("calls onClick when clicked", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Save</Button>);
    await userEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("is disabled when disabled or loading", async () => {
    const onClick = vi.fn();
    const { rerender } = render(
      <Button disabled onClick={onClick}>
        Save
      </Button>
    );
    expect(screen.getByRole("button")).toBeDisabled();
    await userEvent.click(screen.getByRole("button"));
    expect(onClick).not.toHaveBeenCalled();

    rerender(
      <Button loading onClick={onClick}>
        Save
      </Button>
    );
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("renders prepend/append icons with strokeWidth 2", () => {
    render(
      <Button prependIcon={<svg data-testid="pre" />} appendIcon={<svg data-testid="post" />}>
        Save
      </Button>
    );
    expect(screen.getByTestId("pre")).toHaveAttribute("stroke-width", "2");
    expect(screen.getByTestId("post")).toHaveAttribute("stroke-width", "2");
  });

  it("applies variant/size styling and custom className", () => {
    render(
      <Button variant="danger" size="lg" className="custom">
        Delete
      </Button>
    );
    const button = screen.getByRole("button");
    expect(button).toHaveClass("custom");
    for (const cls of getButtonStyling("danger", "lg", false).split(" ").filter(Boolean)) {
      expect(button).toHaveClass(cls);
    }
  });
});

describe("button helpers", () => {
  it("uses disabled styling when disabled", () => {
    expect(getButtonStyling("primary", "md", true)).toContain("cursor-not-allowed");
    expect(getButtonStyling("primary", "md", false)).toContain("hover:");
  });

  it("returns size-specific icon classes", () => {
    expect(getIconStyling("sm")).toContain("h-3 w-3");
    expect(getIconStyling("lg")).toContain("h-4 w-4");
  });
});
