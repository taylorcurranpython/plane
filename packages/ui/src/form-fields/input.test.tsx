/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { Input } from "./input";
import { PasswordInput } from "./password";
import { TextArea } from "./textarea";

describe("Input", () => {
  it("forwards native props and the ref", () => {
    const ref = createRef<HTMLInputElement>();
    render(<Input id="name" name="name" placeholder="Name" ref={ref} />);
    const input = screen.getByPlaceholderText("Name");
    expect(input).toHaveAttribute("id", "name");
    expect(input).toHaveAttribute("autocomplete", "off");
    expect(ref.current).toBe(input);
  });

  it("emits onChange as the user types", async () => {
    const onChange = vi.fn();
    render(<Input placeholder="Name" onChange={onChange} />);
    await userEvent.type(screen.getByPlaceholderText("Name"), "abc");
    expect(onChange).toHaveBeenCalledTimes(3);
    expect(screen.getByPlaceholderText("Name")).toHaveValue("abc");
  });

  it("applies error and size classes", () => {
    render(<Input placeholder="Name" hasError inputSize="md" mode="transparent" />);
    const input = screen.getByPlaceholderText("Name");
    expect(input).toHaveClass("border-danger-strong", "p-3", "bg-transparent");
  });
});

describe("TextArea", () => {
  it("renders a controlled value and error state", () => {
    render(<TextArea id="desc" value="hello" hasError onChange={() => {}} />);
    const textarea = screen.getByDisplayValue("hello");
    expect(textarea.tagName).toBe("TEXTAREA");
    expect(textarea).toHaveClass("border-danger-strong");
  });
});

describe("PasswordInput", () => {
  it("masks the value and toggles visibility", async () => {
    const onChange = vi.fn();
    render(<PasswordInput id="pw" value="secret" onChange={onChange} />);
    const input = screen.getByPlaceholderText("Enter your password");
    expect(input).toHaveAttribute("type", "password");

    await userEvent.click(screen.getByRole("button"));
    expect(input).toHaveAttribute("type", "text");
  });

  it("reports changes with the raw string value", async () => {
    const onChange = vi.fn();
    render(<PasswordInput id="pw" value="" onChange={onChange} showToggle={false} />);
    expect(screen.queryByRole("button")).toBeNull();
    await userEvent.type(screen.getByPlaceholderText("Enter your password"), "x");
    expect(onChange).toHaveBeenCalledWith("x");
  });
});
