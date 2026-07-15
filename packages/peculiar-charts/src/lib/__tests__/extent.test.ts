import { combineExtents, finiteExtent } from "../extent";
import { describe, expect, it } from "vitest";

describe("finiteExtent", () => {
  it("ignores missing and non-finite values", () => {
    expect(finiteExtent([undefined, 4, Number.NaN, null, -2, Number.POSITIVE_INFINITY])).toEqual({
      min: -2,
      max: 4,
    });
  });

  it("does not return an extent without finite values", () => {
    expect(finiteExtent([undefined, Number.NaN, Number.POSITIVE_INFINITY])).toBeUndefined();
    expect(finiteExtent([])).toBeUndefined();
  });

  it("handles large iterables without spreading function arguments", () => {
    expect(finiteExtent(Array.from({ length: 200_000 }, (_, index) => index))).toEqual({
      min: 0,
      max: 199_999,
    });
  });
});

describe("combineExtents", () => {
  it("combines valid extents and ignores invalid registry entries", () => {
    expect(
      combineExtents([
        { min: 2, max: 5 },
        { min: Number.NaN, max: 9 },
        undefined,
        { min: -3, max: 1 },
      ]),
    ).toEqual({ min: -3, max: 5 });
  });
});
