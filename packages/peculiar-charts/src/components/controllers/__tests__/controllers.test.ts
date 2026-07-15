import { createAxisController } from "../createAxisController";
import { createSeriesController } from "../createSeriesController";
import { createStackBarController } from "../createStackBarController";
import { createStackScope, stackScopeKey } from "@src/lib/stacking";
import { createRoot, createSignal } from "solid-js";
import { describe, expect, it } from "vitest";

describe("createAxisController", () => {
  it("owns reactive domain contributions independently", () =>
    createRoot((dispose) => {
      const [data, setData] = createSignal([{ x: 2 }, { x: 8 }]);
      const controller = createAxisController(data);
      controller.registerAxisConfig("x", "axis-owner", {
        orientation: "x",
        type: "linear",
        dataKey: "x",
        range: null,
        reverse: false,
      });

      expect(controller.getDomain("x", "x")).toEqual({
        kind: "numeric",
        min: 2,
        max: 8,
        userDefined: false,
      });
      setData([{ x: -4 }, { x: 12 }]);
      expect(controller.getDomain("x", "x")).toEqual({
        kind: "numeric",
        min: -4,
        max: 12,
        userDefined: false,
      });
      dispose();
    }));
});

describe("createSeriesController", () => {
  it("keeps palette order stable and releases visibility ownership", () =>
    createRoot((dispose) => {
      const controller = createSeriesController();
      controller.registerSeriesMeta("first", { name: "First", type: "line" });
      controller.registerSeriesMeta("second", { name: "Second", type: "bar" });
      expect(controller.seriesMeta().map((series) => series.id)).toEqual(["first", "second"]);

      controller.toggleSeries("first");
      expect(controller.isSeriesVisible("first")).toBe(false);
      controller.unregisterSeriesMeta("first");
      expect(controller.isSeriesVisible("first")).toBe(true);
      dispose();
    }));
});

describe("createStackBarController", () => {
  it("owns scoped stack members and grouped-bar slots independently", () =>
    createRoot((dispose) => {
      const controller = createStackBarController();
      const scope = createStackScope({
        layout: "vertical",
        xAxisId: "x",
        yAxisId: "y",
        stackId: "stack",
      });
      controller.registerStack(scope, { seriesId: "a", dataKey: "value", values: [1, 2] });
      controller.registerStack(scope, { seriesId: "b", dataKey: "value", values: [3, 4] });
      controller.registerBar("bar-scope", "stack", "a");
      controller.registerBar("bar-scope", "stack", "b");

      expect(controller.stacks().get(stackScopeKey(scope))?.entries.size).toBe(2);
      expect(controller.bars().get("bar-scope")?.get("stack")?.size).toBe(2);
      controller.unregisterStack(scope, "a");
      controller.unregisterBar("bar-scope", "stack", "a");
      expect(controller.stacks().get(stackScopeKey(scope))?.entries.has("b")).toBe(true);
      expect(controller.bars().get("bar-scope")?.get("stack")?.has("b")).toBe(true);
      dispose();
    }));
});
