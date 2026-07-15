import { describe, expect, it } from "vitest";
import { createRoot, createSignal } from "solid-js";
import { createMockChartContext } from "./helpers";
import createScale from "@src/lib/createScale";

describe("createScale", () => {
  it("creates a point scale for x-axis", () =>
    createRoot((dispose) => {
      const ctx = createMockChartContext({
        getDomain: () => ({
          kind: "categorical",
          values: ["a", "b", "c"],
        }),
        getAxisConfig: () => ({
          orientation: "x",
          type: "point",
          range: null,
          reverse: false,
        }),
      });

      const scale = createScale({
        axisId: () => "x",
        orientation: () => "x",
        chartContext: ctx,
      });

      const s = scale();
      expect(s.type).toBe("point");
      if (s.type === "point") {
        expect(s.scale.domain()).toEqual(["a", "b", "c"]);
      }
      dispose();
    }));

  it("creates a linear scale for y-axis", () =>
    createRoot((dispose) => {
      const ctx = createMockChartContext({
        getDomain: () => ({
          kind: "numeric",
          min: 0,
          max: 100,
          userDefined: false,
        }),
        getAxisConfig: () => ({
          orientation: "y",
          type: "linear",
          range: null,
          reverse: false,
        }),
      });

      const scale = createScale({
        axisId: () => "y",
        orientation: () => "y",
        chartContext: ctx,
      });

      const s = scale();
      expect(s.type).toBe("linear");
      dispose();
    }));

  it("reacts to domain changes", () =>
    createRoot((dispose) => {
      const [domain, setDomain] = createSignal({
        kind: "categorical" as const,
        values: ["a", "b"],
      });
      const ctx = createMockChartContext({
        getDomain: domain,
        getAxisConfig: () => ({
          orientation: "x",
          type: "point",
          range: null,
          reverse: false,
        }),
      });

      const scale = createScale({
        axisId: () => "x",
        orientation: () => "x",
        chartContext: ctx,
      });

      const s1 = scale();
      if (s1.type === "point") {
        expect(s1.scale.domain()).toEqual(["a", "b"]);
      }

      setDomain({ kind: "categorical", values: ["x", "y", "z"] });
      const s2 = scale();
      if (s2.type === "point") {
        expect(s2.scale.domain()).toEqual(["x", "y", "z"]);
      }
      dispose();
    }));

  it("inverts y-axis pixel range", () =>
    createRoot((dispose) => {
      const ctx = createMockChartContext({
        height: () => 400,
        getDomain: () => ({
          kind: "numeric",
          min: 0,
          max: 100,
          userDefined: false,
        }),
        getAxisConfig: () => ({
          orientation: "y",
          type: "linear",
          range: null,
          reverse: false,
        }),
      });

      const scale = createScale({
        axisId: () => "y",
        orientation: () => "y",
        chartContext: ctx,
      });

      const s = scale();
      // y-axis: 0 maps to bottom (400), 100 maps to top (0)
      if (s.type === "linear") {
        expect(s.scale(0)).toBe(400);
        expect(s.scale(100)).toBe(0);
      }
      dispose();
    }));

  it("keeps automatic positive log domains away from zero", () =>
    createRoot((dispose) => {
      const ctx = createMockChartContext({
        getDomain: () => ({ kind: "numeric", min: 1, max: 100, userDefined: false }),
        getAxisConfig: () => ({
          orientation: "y",
          type: "log",
          range: null,
          reverse: false,
        }),
      });
      const scale = createScale({
        axisId: () => "y",
        orientation: () => "y",
        chartContext: ctx,
      })();

      expect(scale.type).toBe("log");
      if (scale.type === "log") {
        expect(scale.scale.domain()).toEqual([1, 100]);
        expect(Number.isFinite(scale.scale(10))).toBe(true);
      }
      dispose();
    }));

  it("supports automatic negative log domains", () =>
    createRoot((dispose) => {
      const ctx = createMockChartContext({
        getDomain: () => ({ kind: "numeric", min: -100, max: -1, userDefined: false }),
        getAxisConfig: () => ({
          orientation: "y",
          type: "log",
          range: null,
          reverse: false,
        }),
      });
      const scale = createScale({
        axisId: () => "y",
        orientation: () => "y",
        chartContext: ctx,
      })();

      expect(scale.type).toBe("log");
      if (scale.type === "log") expect(Number.isFinite(scale.scale(-10))).toBe(true);
      dispose();
    }));

  it.each([
    [0, 100],
    [-1, 100],
    [Number.NaN, 100],
  ])("rejects an invalid log domain [%s, %s]", (min, max) => {
    expect(() =>
      createRoot((dispose) => {
        const scale = createScale({
          axisId: () => "y",
          orientation: () => "y",
          chartContext: createMockChartContext({
            getDomain: () => ({ kind: "numeric", min, max, userDefined: false }),
            getAxisConfig: () => ({
              orientation: "y",
              type: "log",
              range: null,
              reverse: false,
            }),
          }),
        });
        scale();
        dispose();
      }),
    ).toThrow(/Log scale domain bounds/);
  });
});
