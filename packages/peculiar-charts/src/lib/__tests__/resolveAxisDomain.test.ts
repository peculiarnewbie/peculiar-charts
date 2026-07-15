import { resolveAxisDomain } from "../resolveAxisDomain";
import type { AxisConfig } from "@src/components/context";
import { describe, expect, it } from "vitest";

const config = (overrides: Partial<AxisConfig>): AxisConfig => ({
  orientation: "x",
  type: "point",
  range: null,
  reverse: false,
  ...overrides,
});

describe("resolveAxisDomain", () => {
  it("applies the same duplicate-category policy to any data source", () => {
    const data = [{ x: "A" }, { x: "A" }, { x: "B" }];
    expect(resolveAxisDomain({ config: config({ dataKey: "x" }), orientation: "x", data })).toEqual(
      { kind: "categorical", values: ["A", "B"] },
    );
    expect(
      resolveAxisDomain({
        config: config({ dataKey: "x", allowDuplicatedCategory: true }),
        orientation: "x",
        data,
      }),
    ).toEqual({ kind: "categorical", values: ["A", "A", "B"] });
  });

  it("combines numeric data and registered extent contributions", () => {
    expect(
      resolveAxisDomain({
        config: config({ type: "linear", dataKey: "x" }),
        orientation: "x",
        data: [{ x: 10 }, { x: 20 }],
        extents: [{ min: -5, max: 30 }],
      }),
    ).toEqual({ kind: "numeric", min: -5, max: 30, userDefined: false });
  });

  it("resolves explicit and expression ranges after aggregation", () => {
    expect(
      resolveAxisDomain({
        config: config({
          type: "linear",
          range: ["dataMin - 2", "dataMax + 3"],
        }),
        orientation: "y",
        data: [],
        extents: [{ min: 4, max: 8 }],
      }),
    ).toEqual({ kind: "numeric", min: 2, max: 11, userDefined: true });
  });

  it("uses one deterministic empty numeric domain", () => {
    expect(
      resolveAxisDomain({
        config: config({ type: "linear" }),
        orientation: "y",
        data: [],
      }),
    ).toEqual({ kind: "numeric", min: 0, max: 0, userDefined: false });
  });
});
