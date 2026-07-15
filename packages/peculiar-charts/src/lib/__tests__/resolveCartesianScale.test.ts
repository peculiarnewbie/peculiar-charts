import { resolveCartesianScale } from "../resolveCartesianScale";
import { projectScale } from "../scale";
import type { AxisConfig } from "@src/components/context";
import { describe, expect, it } from "vitest";

const config = (overrides: Partial<AxisConfig>): AxisConfig => ({
  orientation: "x",
  type: "point",
  range: null,
  reverse: false,
  ...overrides,
});

describe("resolveCartesianScale", () => {
  it("combines reversal, axis padding, and bar padding in one range", () => {
    const scale = resolveCartesianScale({
      config: config({ reverse: true, padding: { left: 10, right: 20 } }),
      domain: { kind: "categorical", values: ["A", "B", "C"] },
      orientation: "x",
      width: 400,
      height: 300,
      insets: { top: 8, right: 8, bottom: 8, left: 8 },
      barPadding: 12,
    });

    expect(projectScale(scale, "A")).toBe(360);
    expect(projectScale(scale, "C")).toBe(30);
  });

  it("resolves irregular numeric and time values through the same pipeline", () => {
    const numeric = resolveCartesianScale({
      config: config({ type: "linear" }),
      domain: { kind: "numeric", min: 0, max: 100, userDefined: false },
      orientation: "x",
      width: 400,
      height: 300,
      insets: { top: 0, right: 0, bottom: 0, left: 0 },
    });
    const time = resolveCartesianScale({
      config: config({ type: "time" }),
      domain: {
        kind: "numeric",
        min: new Date("2020-01-01").getTime(),
        max: new Date("2020-01-11").getTime(),
        userDefined: false,
      },
      orientation: "x",
      width: 400,
      height: 300,
      insets: { top: 0, right: 0, bottom: 0, left: 0 },
    });

    expect(projectScale(numeric, 10)).toBe(40);
    expect(projectScale(time, new Date("2020-01-06"))).toBe(200);
  });
});
