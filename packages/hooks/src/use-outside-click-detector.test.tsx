/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { fireEvent, render, screen } from "@testing-library/react";
import { useRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { useOutsideClickDetector } from "./use-outside-click-detector";

function Harness({ onOutsideClick }: { onOutsideClick: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useOutsideClickDetector(ref, onOutsideClick);
  return (
    <div>
      <div ref={ref} data-testid="inside">
        <button type="button">inner</button>
      </div>
      <button type="button" data-testid="outside">
        outside
      </button>
      <div data-prevent-outside-click>
        <button type="button" data-testid="protected">
          protected
        </button>
      </div>
    </div>
  );
}

describe("useOutsideClickDetector", () => {
  it("fires the callback for clicks outside the ref", () => {
    const callback = vi.fn();
    render(<Harness onOutsideClick={callback} />);
    fireEvent.mouseDown(screen.getByTestId("outside"));
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("ignores clicks inside the ref", () => {
    const callback = vi.fn();
    render(<Harness onOutsideClick={callback} />);
    fireEvent.mouseDown(screen.getByText("inner"));
    expect(callback).not.toHaveBeenCalled();
  });

  it("ignores clicks inside data-prevent-outside-click containers", () => {
    const callback = vi.fn();
    render(<Harness onOutsideClick={callback} />);
    fireEvent.mouseDown(screen.getByTestId("protected"));
    expect(callback).not.toHaveBeenCalled();
  });

  it("removes the listener on unmount", () => {
    const callback = vi.fn();
    const { unmount } = render(<Harness onOutsideClick={callback} />);
    unmount();
    fireEvent.mouseDown(document.body);
    expect(callback).not.toHaveBeenCalled();
  });
});
