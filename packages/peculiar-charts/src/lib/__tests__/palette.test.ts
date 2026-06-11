import { describe, expect, it } from "vitest";
import { DEFAULT_PALETTE, paletteColor } from "../palette";

describe("paletteColor", () => {
  it("returns colors from the palette in order", () => {
    expect(paletteColor(0)).toBe(DEFAULT_PALETTE[0]);
    expect(paletteColor(1)).toBe(DEFAULT_PALETTE[1]);
    expect(paletteColor(2)).toBe(DEFAULT_PALETTE[2]);
  });

  it("wraps around when order exceeds palette length", () => {
    const len = DEFAULT_PALETTE.length;
    expect(paletteColor(len)).toBe(DEFAULT_PALETTE[0]);
    expect(paletteColor(len + 1)).toBe(DEFAULT_PALETTE[1]);
    expect(paletteColor(len * 2)).toBe(DEFAULT_PALETTE[0]);
  });

  it("works with large indices", () => {
    expect(paletteColor(1000)).toBe(DEFAULT_PALETTE[1000 % DEFAULT_PALETTE.length]);
  });
});

describe("DEFAULT_PALETTE", () => {
  it("has 10 colors", () => {
    expect(DEFAULT_PALETTE).toHaveLength(10);
  });

  it("contains valid hex colors", () => {
    for (const color of DEFAULT_PALETTE) {
      expect(color).toMatch(/^#[0-9a-f]{6}$/);
    }
  });
});
