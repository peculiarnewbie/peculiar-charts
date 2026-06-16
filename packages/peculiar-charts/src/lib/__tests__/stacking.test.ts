import type { Stack } from "@src/lib/stacking";
import { describe, expect, it } from "vitest";
import { stackBaseValue, stackExtent, stackKeys, stackTopValue } from "../stacking";

const stack = (values: Record<string, number[]>): Stack =>
  new Map(
    Object.entries(values).map(([key, seriesValues]) => [
      key,
      { seriesIds: new Set([key]), values: seriesValues },
    ]),
  );

describe("stacking", () => {
  it("stacks cumulatively with offset none", () => {
    const s = stack({
      a: [10],
      b: [-4],
      c: [6],
    });
    const keys = stackKeys(s);

    expect(
      stackBaseValue({ stack: s, keys, dataKey: "c", index: 0, value: 6, offset: "none" }),
    ).toBe(6);
    expect(
      stackTopValue({ stack: s, keys, dataKey: "c", index: 0, value: 6, offset: "none" }),
    ).toBe(12);
    expect(stackExtent(s, "none")).toEqual({ min: 0, max: 12 });
  });

  it("stacks positive and negative values separately with offset sign", () => {
    const s = stack({
      a: [10],
      b: [-4],
      c: [6],
      d: [-3],
    });
    const keys = stackKeys(s);

    expect(
      stackBaseValue({ stack: s, keys, dataKey: "c", index: 0, value: 6, offset: "sign" }),
    ).toBe(10);
    expect(
      stackTopValue({ stack: s, keys, dataKey: "c", index: 0, value: 6, offset: "sign" }),
    ).toBe(16);
    expect(
      stackBaseValue({ stack: s, keys, dataKey: "d", index: 0, value: -3, offset: "sign" }),
    ).toBe(-4);
    expect(
      stackTopValue({ stack: s, keys, dataKey: "d", index: 0, value: -3, offset: "sign" }),
    ).toBe(-7);
    expect(stackExtent(s, "sign")).toEqual({ min: -7, max: 16 });
  });

  it("normalizes cumulative values with offset expand", () => {
    const s = stack({
      a: [10],
      b: [30],
      c: [60],
    });
    const keys = stackKeys(s);

    expect(
      stackBaseValue({ stack: s, keys, dataKey: "c", index: 0, value: 60, offset: "expand" }),
    ).toBe(0.4);
    expect(
      stackTopValue({ stack: s, keys, dataKey: "c", index: 0, value: 60, offset: "expand" }),
    ).toBe(1);
    expect(stackExtent(s, "expand")).toEqual({ min: 0, max: 1 });
  });

  it("centers columns around zero with offset silhouette", () => {
    const s = stack({
      a: [10],
      b: [30],
      c: [60],
    });
    const keys = stackKeys(s);

    expect(
      stackBaseValue({ stack: s, keys, dataKey: "a", index: 0, value: 10, offset: "silhouette" }),
    ).toBe(-50);
    expect(
      stackTopValue({ stack: s, keys, dataKey: "c", index: 0, value: 60, offset: "silhouette" }),
    ).toBe(50);
    expect(stackExtent(s, "silhouette")).toEqual({ min: -50, max: 50 });
  });
});
