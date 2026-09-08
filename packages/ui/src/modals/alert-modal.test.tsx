/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AlertModalCore } from "./alert-modal";
import { ModalCore } from "./modal-core";

describe("ModalCore", () => {
  it("renders children only while open", () => {
    const { rerender } = render(
      <ModalCore isOpen={false}>
        <p>Body</p>
      </ModalCore>
    );
    expect(screen.queryByText("Body")).toBeNull();

    rerender(
      <ModalCore isOpen>
        <p>Body</p>
      </ModalCore>
    );
    expect(screen.getByText("Body")).toBeInTheDocument();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("calls handleClose on Escape", async () => {
    const handleClose = vi.fn();
    render(
      <ModalCore isOpen handleClose={handleClose}>
        <p>Body</p>
      </ModalCore>
    );
    await userEvent.keyboard("{Escape}");
    expect(handleClose).toHaveBeenCalled();
  });
});

describe("AlertModalCore", () => {
  const renderModal = (overrides: Partial<React.ComponentProps<typeof AlertModalCore>> = {}) => {
    const props = {
      isOpen: true,
      isSubmitting: false,
      title: "Delete project",
      content: "This cannot be undone.",
      handleClose: vi.fn(),
      handleSubmit: vi.fn(),
      ...overrides,
    };
    render(<AlertModalCore {...props} />);
    return props;
  };

  it("renders title, content and default button labels", () => {
    renderModal();
    expect(screen.getByText("Delete project")).toBeInTheDocument();
    expect(screen.getByText("This cannot be undone.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
  });

  it("wires the buttons to the handlers", async () => {
    const props = renderModal();
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(props.handleClose).toHaveBeenCalledTimes(1);
    await userEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(props.handleSubmit).toHaveBeenCalledTimes(1);
  });

  it("shows the loading label and disables submit while submitting", () => {
    renderModal({ isSubmitting: true, primaryButtonText: { default: "Archive", loading: "Archiving" } });
    const submit = screen.getByRole("button", { name: "Archiving" });
    expect(submit).toBeDisabled();
  });
});
