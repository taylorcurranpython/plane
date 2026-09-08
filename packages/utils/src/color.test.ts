/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { describe, expect, it } from "vitest";
import {
  darkenColor,
  generateRandomColor,
  getContrastRatio,
  getLuminance,
  hexToHsl,
  hexToRgb,
  hslToHex,
  lightenColor,
  rgbToHex,
  toHex,
  validateColor,
} from "./color";

describe("validateColor / toHex", () => {
  it("clamps and floors values", () => {
    expect(validateColor(-10)).toBe(0);
    expect(validateColor(300)).toBe(255);
    expect(validateColor(128.9)).toBe(128);
  });

  it("pads hex values", () => {
    expect(toHex(0)).toBe("00");
    expect(toHex(255)).toBe("ff");
    expect(toHex(10)).toBe("0a");
  });
});

describe("hexToRgb / rgbToHex", () => {
  it("round-trips primary colours", () => {
    expect(hexToRgb("#ff0000")).toEqual({ r: 255, g: 0, b: 0 });
    expect(hexToRgb("00ff00")).toEqual({ r: 0, g: 255, b: 0 });
    expect(rgbToHex({ r: 0, g: 0, b: 255 })).toBe("#0000ff");
    expect(rgbToHex(hexToRgb("#1a2b3c"))).toBe("#1a2b3c");
  });

  it("falls back to black for invalid hex", () => {
    expect(hexToRgb("nope")).toEqual({ r: 0, g: 0, b: 0 });
  });
});

describe("hexToHsl / hslToHex", () => {
  it("converts primary colours", () => {
    expect(hexToHsl("#ff0000")).toEqual({ h: 0, s: 100, l: 50 });
    expect(hexToHsl("#00ff00")).toEqual({ h: 120, s: 100, l: 50 });
    expect(hexToHsl("#0000ff")).toEqual({ h: 240, s: 100, l: 50 });
    expect(hexToHsl("#808080").s).toBe(0);
  });

  it("returns zeros for invalid hex", () => {
    expect(hexToHsl("ff0000")).toEqual({ h: 0, s: 0, l: 0 });
  });

  it("round-trips through hslToHex", () => {
    expect(hslToHex({ h: 0, s: 100, l: 50 })).toBe("#ff0000");
    expect(hslToHex({ h: 120, s: 100, l: 50 })).toBe("#00ff00");
    expect(hslToHex(hexToHsl("#336699"))).toBe("#336699");
  });
});

describe("luminance and contrast", () => {
  it("computes relative luminance", () => {
    expect(getLuminance({ r: 0, g: 0, b: 0 })).toBe(0);
    expect(getLuminance({ r: 255, g: 255, b: 255 })).toBeCloseTo(1, 5);
  });

  it("computes WCAG contrast ratio", () => {
    expect(getContrastRatio({ r: 0, g: 0, b: 0 }, { r: 255, g: 255, b: 255 })).toBeCloseTo(21, 0);
    expect(getContrastRatio({ r: 255, g: 255, b: 255 }, { r: 0, g: 0, b: 0 })).toBeCloseTo(21, 0);
    expect(getContrastRatio({ r: 100, g: 100, b: 100 }, { r: 100, g: 100, b: 100 })).toBe(1);
  });
});

describe("lightenColor / darkenColor", () => {
  it("moves towards white or black and clamps", () => {
    expect(lightenColor({ r: 0, g: 0, b: 0 }, 1)).toEqual({ r: 255, g: 255, b: 255 });
    expect(darkenColor({ r: 255, g: 255, b: 255 }, 1)).toEqual({ r: 0, g: 0, b: 0 });
    expect(lightenColor({ r: 100, g: 100, b: 100 }, 0.5)).toEqual({ r: 177.5, g: 177.5, b: 177.5 });
    expect(darkenColor({ r: 100, g: 100, b: 100 }, 0.5)).toEqual({ r: 50, g: 50, b: 50 });
  });
});

describe("generateRandomColor", () => {
  it("is deterministic for the same input and within HSL ranges", () => {
    const a = generateRandomColor("plane");
    const b = generateRandomColor("plane");
    expect(a).toEqual(b);
    expect(a.h).toBeGreaterThanOrEqual(0);
    expect(a.h).toBeLessThan(360);
    expect(a.s).toBeGreaterThanOrEqual(0);
    expect(a.s).toBeLessThanOrEqual(100);
    expect(a.l).toBeGreaterThanOrEqual(0);
    expect(a.l).toBeLessThanOrEqual(100);
  });
});
