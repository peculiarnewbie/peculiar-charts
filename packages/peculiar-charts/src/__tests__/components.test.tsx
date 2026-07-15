import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render } from "@solidjs/testing-library";
import Chart from "@src/components/Chart";
import Brush from "@src/components/Brush";
import Line from "@src/series/Line";
import Area from "@src/series/Area";
import Bar from "@src/series/Bar";
import Point from "@src/series/Point";
import Bubble from "@src/series/Bubble";
import Pie from "@src/series/Pie";
import Radar from "@src/series/Radar";
import RadialBar from "@src/series/RadialBar";
import Axis from "@src/axis/Axis";
import AxisLabel from "@src/axis/Label";
import AxisMark from "@src/axis/Mark";
import AxisGrid from "@src/axis/Grid";
import AxisTooltip from "@src/axis/Tooltip";
import PolarLayout from "@src/axis/polar/PolarLayout";
import PolarAngleAxis from "@src/axis/polar/PolarAngleAxis";
import PolarRadiusAxis from "@src/axis/polar/PolarRadiusAxis";
import { useChartContext } from "@src/components/context";
import { TooltipContent } from "@src/lib/tooltip";
import { syncBus } from "@src/lib/sync";
import { expectLines, expectBars, expectPieSectors } from "./helpers";
import { cartesianData as data, bubbleData, pieData, radarData } from "./helpers/_data";
import { createEffect, createSignal } from "solid-js";

afterEach(() => vi.unstubAllGlobals());

describe("Chart", () => {
  it("renders an SVG with data-pc-chart attribute", () => {
    const { container } = render(() => (
      <Chart data={data} width={400} height={300}>
        <Axis axis="x" position="bottom" dataKey="x" />
        <Axis axis="y" position="left" />
        <Line dataKey="y" />
      </Chart>
    ));

    const svg = container.querySelector("[data-pc-chart]");
    expect(svg).not.toBeNull();
    expect(svg?.tagName).toBe("svg");
  });

  it("renders a wrapper div with data-pc-wrapper", () => {
    const { container } = render(() => <Chart data={data} width={400} height={300} />);

    const wrapper = container.querySelector("[data-pc-wrapper]");
    expect(wrapper).not.toBeNull();
    expect(wrapper?.tagName).toBe("DIV");
  });

  it("sets viewBox from width/height props", () => {
    const { container } = render(() => <Chart data={data} width={500} height={250} />);

    const svg = container.querySelector("svg");
    expect(svg?.getAttribute("viewBox")).toBe("0 0 500 250");
  });

  it("deep-merges a partial bar configuration", () => {
    expect(() =>
      render(() => (
        <Chart data={data} width={400} height={300} barConfig={{ barGap: 4 }}>
          <Bar dataKey="y" />
        </Chart>
      )),
    ).not.toThrow();
  });

  it("ignores missing and invalid values when inferring a series domain", () => {
    const sparseData = [{ y: undefined }, { y: 8 }, { y: Number.NaN }, { y: -3 }];
    let observedDomain: unknown;
    const Probe = () => {
      const ctx = useChartContext();
      createEffect(() => (observedDomain = ctx.getDomain("y", "y")));
      return null;
    };

    render(() => (
      <Chart data={sparseData} width={400} height={300}>
        <Line dataKey="y" />
        <Probe />
      </Chart>
    ));

    expect(observedDomain).toEqual({ kind: "numeric", min: -3, max: 8, userDefined: false });
  });

  it("deduplicates categorical domains by default and when explicitly disabled", () => {
    const duplicateData = [
      { x: "A", y: 1 },
      { x: "A", y: 2 },
      { x: "B", y: 3 },
    ];
    const domains: any[][] = [];

    const Probe = () => {
      const ctx = useChartContext<typeof duplicateData>();
      createEffect(() => {
        const domain = ctx.getDomain("x", "x");
        if (domain.kind === "categorical") domains.push(domain.values);
      });
      return null;
    };

    render(() => (
      <Chart data={duplicateData} width={400} height={300}>
        <Axis axis="x" position="bottom" dataKey="x" />
        <Probe />
      </Chart>
    ));

    render(() => (
      <Chart data={duplicateData} width={400} height={300}>
        <Axis axis="x" position="bottom" dataKey="x" allowDuplicatedCategory={false} />
        <Probe />
      </Chart>
    ));

    expect(domains).toContainEqual(["A", "B"]);
    expect(domains.every((values) => values.length === 2)).toBe(true);
  });

  it("only emits sync events when the active datum changes", () => {
    const emit = vi.spyOn(syncBus, "emit");
    const clientWidth = vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(800);
    const clientHeight = vi
      .spyOn(HTMLElement.prototype, "clientHeight", "get")
      .mockReturnValue(600);
    const { container } = render(() => (
      <Chart data={data} width={400} height={300} syncId="dedupe">
        <Axis axis="x" position="bottom" dataKey="x" />
        <Axis axis="y" position="left" />
        <Line dataKey="y" />
      </Chart>
    ));
    const svg = container.querySelector("svg")!;

    fireEvent.pointerMove(svg, { clientX: 100, clientY: 100 });
    fireEvent.pointerMove(svg, { clientX: 110, clientY: 100 });
    expect(emit).toHaveBeenCalledTimes(1);

    fireEvent.pointerMove(svg, { clientX: 600, clientY: 100 });
    expect(emit).toHaveBeenCalledTimes(2);

    fireEvent.pointerLeave(svg);
    fireEvent.pointerLeave(svg);
    expect(emit).toHaveBeenCalledTimes(3);
    expect(emit.mock.calls.at(-1)?.[1]).toMatchObject({ active: false, index: null });
    emit.mockRestore();
    clientWidth.mockRestore();
    clientHeight.mockRestore();
  });

  it("hit-tests the rendered positions on a reversed, padded, bar-combined custom axis", () => {
    const onChartPointerMove = vi.fn();
    const clientWidth = vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(800);
    const clientHeight = vi
      .spyOn(HTMLElement.prototype, "clientHeight", "get")
      .mockReturnValue(600);
    const { container } = render(() => (
      <Chart
        data={data}
        width={400}
        height={300}
        interactionAxisId="category"
        onChartPointerMove={onChartPointerMove}
      >
        <Axis
          axis="x"
          axisId="category"
          position="bottom"
          dataKey="x"
          reverse
          padding={{ left: 17, right: 29 }}
        />
        <Axis axis="y" position="left" />
        <Bar dataKey="y" xAxisId="category" />
        <Line dataKey="y" xAxisId="category" dot />
      </Chart>
    ));
    const svg = container.querySelector("svg")!;
    const dots = container.querySelectorAll("[data-pc-dot]");

    for (let index = 0; index < dots.length; index++) {
      fireEvent.pointerMove(svg, {
        clientX: Number(dots[index]?.getAttribute("cx")) * 2,
        clientY: 300,
      });
      expect(onChartPointerMove.mock.calls.at(-1)?.[0].index).toBe(index);
    }
    clientWidth.mockRestore();
    clientHeight.mockRestore();
  });

  it.each([
    { type: "linear" as const, values: [0, 10, 100] },
    {
      type: "time" as const,
      values: [new Date("2020-01-01"), new Date("2020-01-02"), new Date("2020-02-01")],
    },
  ])("hit-tests irregular $type values at their rendered positions", ({ type, values }) => {
    const numericData = values.map((x, index) => ({ x, y: index + 1 }));
    const onChartPointerMove = vi.fn();
    const clientWidth = vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(800);
    const clientHeight = vi
      .spyOn(HTMLElement.prototype, "clientHeight", "get")
      .mockReturnValue(600);
    const { container } = render(() => (
      <Chart data={numericData} width={400} height={300} onChartPointerMove={onChartPointerMove}>
        <Axis axis="x" position="bottom" dataKey="x" type={type} />
        <Axis axis="y" position="left" />
        <Line dataKey="y" dot />
      </Chart>
    ));
    const svg = container.querySelector("svg")!;
    const dots = container.querySelectorAll("[data-pc-dot]");

    for (let index = 0; index < dots.length; index++) {
      fireEvent.pointerMove(svg, {
        clientX: Number(dots[index]?.getAttribute("cx")) * 2,
        clientY: 300,
      });
      expect(onChartPointerMove.mock.calls.at(-1)?.[0].index).toBe(index);
    }
    clientWidth.mockRestore();
    clientHeight.mockRestore();
  });

  it("includes the configured interaction axis in sync payloads", () => {
    const emit = vi.spyOn(syncBus, "emit");
    const clientWidth = vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(800);
    const clientHeight = vi
      .spyOn(HTMLElement.prototype, "clientHeight", "get")
      .mockReturnValue(600);
    const { container } = render(() => (
      <Chart data={data} width={400} height={300} syncId="axis-aware" interactionAxisId="category">
        <Axis axis="x" axisId="category" position="bottom" dataKey="x" />
        <Line dataKey="y" xAxisId="category" />
      </Chart>
    ));

    fireEvent.pointerMove(container.querySelector("svg")!, { clientX: 100, clientY: 100 });
    expect(emit).toHaveBeenCalledWith(
      "axis-aware",
      expect.objectContaining({ axisId: "category" }),
      expect.any(Symbol),
    );
    emit.mockRestore();
    clientWidth.mockRestore();
    clientHeight.mockRestore();
  });
});

describe("Axis", () => {
  it("mirrors tick marks inside the plot area", () => {
    const { container } = render(() => (
      <Chart data={data} width={400} height={300}>
        <Axis axis="x" position="bottom" dataKey="x" mirror>
          <AxisMark length={6} />
        </Axis>
      </Chart>
    ));

    const mark = container.querySelector("[data-pc-axis-mark]");
    expect(Number(mark?.getAttribute("y2"))).toBeLessThan(Number(mark?.getAttribute("y1")));
  });

  it("shares reactively filtered label ticks with grids", () => {
    const [interval, setInterval] = createSignal(0);
    const { container } = render(() => (
      <Chart data={data} width={400} height={300}>
        <Axis axis="x" position="bottom" dataKey="x">
          <AxisLabel interval={interval()} />
          <AxisGrid />
        </Axis>
      </Chart>
    ));

    expect(container.querySelectorAll("[data-pc-axis-label]")).toHaveLength(3);
    expect(container.querySelectorAll("[data-pc-axis-grid]")).toHaveLength(3);

    setInterval(2);

    expect(container.querySelectorAll("[data-pc-axis-label]")).toHaveLength(2);
    expect(container.querySelectorAll("[data-pc-axis-grid]")).toHaveLength(2);
  });
});

describe("Tooltip", () => {
  it("renders a default index before pointer interaction", () => {
    const { container } = render(() => (
      <Chart data={data} width={400} height={300}>
        <Axis axis="x" position="bottom" dataKey="x">
          <AxisTooltip defaultIndex={1} />
        </Axis>
        <Axis axis="y" position="left" />
        <Line dataKey="y" name="Value" />
      </Chart>
    ));

    const tooltip = container.querySelector("[data-pc-axis-tooltip]");
    expect(tooltip).not.toBeNull();
    expect(tooltip?.textContent).toContain(String(data[1]!.x));
    expect(tooltip?.getAttribute("style")).toContain("opacity: 1");
  });

  it("appends function children to the default tooltip content", () => {
    const payload = {
      data: data[1]!,
      index: 1,
      label: data[1]!.x,
      series: [],
    };
    const { container } = render(() => (
      <TooltipContent payload={payload}>
        {(active) => <p data-test-tooltip-extra="">sample {active.index + 1}</p>}
      </TooltipContent>
    ));

    expect(container.querySelector("[data-pc-tooltip-header]")?.textContent).toBe(
      String(data[1]!.x),
    );
    expect(container.querySelector("[data-test-tooltip-extra]")?.textContent).toBe("sample 2");
  });
});

describe("Line", () => {
  it("renders a path with data-pc-line attribute", () => {
    const { container } = render(() => (
      <Chart data={data} width={400} height={300}>
        <Axis axis="x" position="bottom" dataKey="x" />
        <Axis axis="y" position="left" />
        <Line dataKey="y" />
      </Chart>
    ));

    expectLines(container, [{ d: expect.any(String) }]);
  });

  it("applies stroke and fill props", () => {
    const { container } = render(() => (
      <Chart data={data} width={400} height={300}>
        <Axis axis="x" position="bottom" dataKey="x" />
        <Axis axis="y" position="left" />
        <Line dataKey="y" stroke="red" />
      </Chart>
    ));

    expectLines(container, [{ stroke: "red" }]);
  });

  it("clips to the plot area when a bound axis allows data overflow", () => {
    const { container } = render(() => (
      <Chart data={data} width={400} height={300}>
        <Axis
          axis="x"
          position="bottom"
          dataKey="x"
          type="linear"
          axisRange={[1, 2]}
          allowDataOverflow
        />
        <Axis axis="y" position="left" />
        <Line dataKey="y" />
      </Chart>
    ));

    const lineGroup = container.querySelector("[clip-path^='url(#']");
    expect(lineGroup).not.toBeNull();
  });

  it("reports entrance only during the initial custom-shape animation", () => {
    let animationId = 0;
    const callbacks = new Map<number, FrameRequestCallback>();
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
      const id = ++animationId;
      callbacks.set(id, callback);
      return id;
    });
    vi.stubGlobal("cancelAnimationFrame", (id: number) => callbacks.delete(id));

    const lineEntrance: (boolean | undefined)[] = [];
    const areaEntrance: (boolean | undefined)[] = [];
    render(() => (
      <Chart data={data} width={400} height={300}>
        <Axis axis="x" position="bottom" dataKey="x" />
        <Axis axis="y" position="left" />
        <Line
          dataKey="y"
          animation={{ enabled: true, duration: 100 }}
          shape={(shape) => {
            lineEntrance.push(shape.isEntrance);
            return <path data-test-custom-line="" />;
          }}
        />
        <Area
          dataKey="y"
          animation={{ enabled: true, duration: 100 }}
          shape={(shape) => {
            areaEntrance.push(shape.isEntrance);
            return <path data-test-custom-area="" />;
          }}
        />
      </Chart>
    ));

    expect(lineEntrance).toContain(true);
    expect(areaEntrance).toContain(true);

    const runFrame = (time: number) => {
      for (const [id, callback] of Array.from(callbacks)) {
        callbacks.delete(id);
        callback(time);
      }
    };
    const initialStart = performance.now();
    runFrame(initialStart);
    runFrame(initialStart + 101);

    expect(lineEntrance.at(-1)).toBe(false);
    expect(areaEntrance.at(-1)).toBe(false);
  });
});

describe("Area", () => {
  const axes = () => (
    <>
      <Axis axis="x" position="bottom" dataKey="x" />
      <Axis axis="y" position="left" axisRange={[0, 10]} />
    </>
  );

  it.each([0, 1, 3])("aligns stacked baselines across a gap at index %i", (gapIndex) => {
    const base = [1, 2, 3, 4];
    const stackedData = base.map((lower, index) => ({
      x: String.fromCharCode(65 + index),
      lower,
      upper: index === gapIndex ? Number.NaN : 2,
    }));
    const rangedData = base.map((lower, index) => ({
      x: String.fromCharCode(65 + index),
      range:
        index === gapIndex
          ? ([Number.NaN, Number.NaN] as [number, number])
          : ([lower, lower + 2] as [number, number]),
    }));

    const stacked = render(() => (
      <Chart data={stackedData} width={400} height={300}>
        {axes()}
        <Area dataKey="lower" stackId="stack" animation={false} />
        <Area dataKey="upper" stackId="stack" animation={false} />
      </Chart>
    ));
    const ranged = render(() => (
      <Chart data={rangedData} width={400} height={300}>
        {axes()}
        <Area dataKey="range" animation={false} />
      </Chart>
    ));

    expect(stacked.container.querySelectorAll("[data-pc-area]")[1]?.getAttribute("d")).toBe(
      ranged.container.querySelector("[data-pc-area]")?.getAttribute("d"),
    );
    stacked.unmount();
    ranged.unmount();
  });

  it("preserves a ranged baseline for positive and negative fills", () => {
    const rangedData = [
      { x: "A", range: [2, 5] as [number, number] },
      { x: "B", range: [3, 6] as [number, number] },
      { x: "C", range: [1, 4] as [number, number] },
    ];
    const reference = render(() => (
      <Chart data={rangedData} width={400} height={300}>
        {axes()}
        <Area dataKey="range" animation={false} />
      </Chart>
    ));
    const split = render(() => (
      <Chart data={rangedData} width={400} height={300}>
        {axes()}
        <Area dataKey="range" positiveFill="red" negativeFill="blue" animation={false} />
      </Chart>
    ));
    const expected = reference.container.querySelector("[data-pc-area]")?.getAttribute("d");
    const paths = split.container.querySelectorAll("[data-pc-area]");

    expect(paths).toHaveLength(2);
    expect(paths[0]?.getAttribute("d")).toBe(expected);
    expect(paths[1]?.getAttribute("d")).toBe(expected);
    reference.unmount();
    split.unmount();
  });

  it("preserves a stacked baseline for positive and negative fills", () => {
    const stackedData = [
      { x: "A", lower: 2, upper: 3 },
      { x: "B", lower: 3, upper: 2 },
      { x: "C", lower: 1, upper: 4 },
    ];
    const reference = render(() => (
      <Chart data={stackedData} width={400} height={300}>
        {axes()}
        <Area dataKey="lower" stackId="stack" animation={false} />
        <Area dataKey="upper" stackId="stack" animation={false} />
      </Chart>
    ));
    const split = render(() => (
      <Chart data={stackedData} width={400} height={300}>
        {axes()}
        <Area dataKey="lower" stackId="stack" animation={false} />
        <Area
          dataKey="upper"
          stackId="stack"
          positiveFill="red"
          negativeFill="blue"
          animation={false}
        />
      </Chart>
    ));
    const expected = reference.container.querySelectorAll("[data-pc-area]")[1]?.getAttribute("d");
    const paths = split.container.querySelectorAll("[data-pc-area]");

    expect(paths).toHaveLength(3);
    expect(paths[1]?.getAttribute("d")).toBe(expected);
    expect(paths[2]?.getAttribute("d")).toBe(expected);
    reference.unmount();
    split.unmount();
  });
});

describe("Brush", () => {
  it("uses the main axis domain policy with preview dimensions and full data", () => {
    const brushData = [
      { x: 10, y: 2 },
      { x: 20, y: 4 },
    ];
    const { container } = render(() => (
      <Chart data={brushData} width={400} height={300}>
        <Axis axis="x" position="bottom" dataKey="x" type="linear" axisRange={[0, 100]} />
        <Axis axis="y" position="left" axisRange={[0, 10]} />
        <Brush>
          <Line
            dataKey="y"
            animation={false}
            shape={(shape) => (
              <path data-test-brush-points={JSON.stringify(shape.points)} data-test-brush-line="" />
            )}
          />
        </Brush>
      </Chart>
    ));
    const points = JSON.parse(
      container.querySelector("[data-test-brush-line]")?.getAttribute("data-test-brush-points") ??
        "[]",
    ) as [number, number][];

    // Preview width is 398px. With the explicit [0, 100] domain, x=10/20
    // project to 10%/20% rather than being independently stretched to its edges.
    expect(points[0]?.[0]).toBeCloseTo(39.8);
    expect(points[1]?.[0]).toBeCloseTo(79.6);
  });
});

describe("Bar", () => {
  it("renders rect elements", () => {
    const { container } = render(() => (
      <Chart data={data} width={400} height={300}>
        <Axis axis="x" position="bottom" dataKey="x" />
        <Axis axis="y" position="left" />
        <Bar dataKey="y" />
      </Chart>
    ));

    const group = container.querySelector("[data-pc-bar-group]");
    expect(group).not.toBeNull();

    expectBars(container, [{}, {}, {}]);
  });

  it("bars have non-zero dimensions", () => {
    const { container } = render(() => (
      <Chart data={data} width={400} height={300}>
        <Axis axis="x" position="bottom" dataKey="x" />
        <Axis axis="y" position="left" />
        <Bar dataKey="y" />
      </Chart>
    ));

    const rects = container.querySelectorAll("[data-pc-bar]");
    for (const rect of rects) {
      const w = Number(rect.getAttribute("width"));
      const h = Number(rect.getAttribute("height"));
      expect(w).toBeGreaterThan(0);
      expect(h).toBeGreaterThan(0);
    }
  });

  it("aligns band-axis custom labels with bar centers", () => {
    const { container } = render(() => (
      <Chart data={data} width={400} height={300}>
        <Axis axis="x" position="bottom" dataKey="x" type="band">
          <AxisLabel interval={0}>
            {(tick) => <circle data-test-axis-label="" cx={tick.x} cy={tick.y} r={1} />}
          </AxisLabel>
        </Axis>
        <Axis axis="y" position="left" />
        <Bar dataKey="y" />
      </Chart>
    ));

    const rects = [...container.querySelectorAll("[data-pc-bar]")];
    const labels = [...container.querySelectorAll("[data-test-axis-label]")];

    expect(labels.length).toBe(rects.length);

    for (let i = 0; i < rects.length; i++) {
      const rect = rects[i]!;
      const label = labels[i]!;
      const barCenter = Number(rect.getAttribute("x")) + Number(rect.getAttribute("width")) / 2;
      const labelCenter = Number(label.getAttribute("cx"));

      expect(labelCenter).toBeCloseTo(barCenter, 6);
    }
  });

  it("passes stable source indexes to custom shapes", () => {
    const { container } = render(() => (
      <Chart data={data} width={400} height={300}>
        <Axis axis="x" position="bottom" dataKey="x" />
        <Axis axis="y" position="left" />
        <Bar
          dataKey="y"
          shape={(bar) => <rect data-test-bar-index={bar.index} data-test-bar-value={bar.value} />}
        />
      </Chart>
    ));

    expect(
      [...container.querySelectorAll("[data-test-bar-index]")].map((bar) => ({
        index: bar.getAttribute("data-test-bar-index"),
        value: bar.getAttribute("data-test-bar-value"),
      })),
    ).toEqual([
      { index: "0", value: "10" },
      { index: "1", value: "20" },
      { index: "2", value: "15" },
    ]);
  });

  it("keeps non-zero bars visible with minPointSize", () => {
    const tiny = [{ x: "A", y: 0.1 }];
    const { container } = render(() => (
      <Chart data={tiny} width={400} height={300}>
        <Axis axis="x" position="bottom" dataKey="x" />
        <Axis axis="y" position="left" axisRange={[0, 100]} />
        <Bar dataKey="y" minPointSize={12} />
      </Chart>
    ));

    expect(Number(container.querySelector("[data-pc-bar]")?.getAttribute("height"))).toBe(12);
  });

  it("renders a full plot-slot background for every bar", () => {
    const { container } = render(() => (
      <Chart data={data} width={400} height={300}>
        <Axis axis="x" position="bottom" dataKey="x" />
        <Axis axis="y" position="left" />
        <Bar dataKey="y" background={{ fill: "#eee" }} />
      </Chart>
    ));

    const backgrounds = container.querySelectorAll("[data-pc-bar-background]");
    expect(backgrounds).toHaveLength(3);
    expect(backgrounds[0]?.getAttribute("fill")).toBe("#eee");
    expect(Number(backgrounds[0]?.getAttribute("height"))).toBeGreaterThan(
      Number(container.querySelector("[data-pc-bar]")?.getAttribute("height")),
    );
  });
});

describe("Point", () => {
  it("renders circle elements with data-pc-point", () => {
    const { container } = render(() => (
      <Chart data={data} width={400} height={300}>
        <Axis axis="x" position="bottom" dataKey="x" />
        <Axis axis="y" position="left" />
        <Point dataKey="y" />
      </Chart>
    ));

    const group = container.querySelector("[data-pc-point-group]");
    expect(group).not.toBeNull();

    const circles = container.querySelectorAll("[data-pc-point]");
    expect(circles.length).toBe(data.length);
  });

  it("circles have cx, cy, and r attributes", () => {
    const { container } = render(() => (
      <Chart data={data} width={400} height={300}>
        <Axis axis="x" position="bottom" dataKey="x" />
        <Axis axis="y" position="left" />
        <Point dataKey="y" r={6} />
      </Chart>
    ));

    const circles = container.querySelectorAll("[data-pc-point]");
    for (const circle of circles) {
      expect(circle.getAttribute("cx")).toBeTruthy();
      expect(circle.getAttribute("cy")).toBeTruthy();
      const r = Number(circle.getAttribute("r"));
      expect(r).toBeGreaterThanOrEqual(0);
    }
  });

  it("passes source indexes to custom point renderers", () => {
    const { container } = render(() => (
      <Chart data={data} width={400} height={300}>
        <Axis axis="x" position="bottom" dataKey="x" />
        <Axis axis="y" position="left" />
        <Point
          dataKey="y"
          animation={false}
          children={(point) => (
            <circle data-test-point-index={point.index} data-test-point-value={point.value} />
          )}
        />
      </Chart>
    ));

    expect(
      [...container.querySelectorAll("[data-test-point-index]")].map((point) => ({
        index: point.getAttribute("data-test-point-index"),
        value: point.getAttribute("data-test-point-value"),
      })),
    ).toEqual([
      { index: "0", value: "10" },
      { index: "1", value: "20" },
      { index: "2", value: "15" },
    ]);
  });
});

describe("Bubble", () => {
  it("renders circle elements with data-pc-bubble", () => {
    const { container } = render(() => (
      <Chart data={bubbleData} width={400} height={300}>
        <Axis axis="x" position="bottom" dataKey="x" />
        <Axis axis="y" position="left" />
        <Bubble dataKey="y" sizeKey="z" />
      </Chart>
    ));

    const group = container.querySelector("[data-pc-bubble-group]");
    expect(group).not.toBeNull();

    const circles = container.querySelectorAll("[data-pc-bubble]");
    expect(circles.length).toBe(bubbleData.length);
  });

  it("bubble radii vary by size key", () => {
    const { container } = render(() => (
      <Chart data={bubbleData} width={400} height={300}>
        <Axis axis="x" position="bottom" dataKey="x" />
        <Axis axis="y" position="left" />
        <Bubble dataKey="y" sizeKey="z" sizeRange={[4, 20]} />
      </Chart>
    ));

    const circles = container.querySelectorAll("[data-pc-bubble]");
    const radii = [...circles].map((c) => Number(c.getAttribute("r")));
    // All radii should be positive
    expect(radii.every((r) => r > 0)).toBe(true);
    // Radii should not all be the same (size key varies)
    expect(new Set(radii).size).toBeGreaterThan(1);
  });

  it("without sizeKey renders uniform circles", () => {
    const { container } = render(() => (
      <Chart data={bubbleData} width={400} height={300}>
        <Axis axis="x" position="bottom" dataKey="x" />
        <Axis axis="y" position="left" />
        <Bubble dataKey="y" />
      </Chart>
    ));

    const circles = container.querySelectorAll("[data-pc-bubble]");
    const radii = [...circles].map((c) => Number(c.getAttribute("r")));
    // All radii should be the same
    expect(new Set(radii).size).toBe(1);
  });
});

describe("Pie", () => {
  it("renders slice paths with data-pc-pie-slice", () => {
    const { container } = render(() => (
      <Chart data={pieData} width={400} height={400}>
        <Pie dataKey="value" nameKey="name" />
      </Chart>
    ));

    const group = container.querySelector("[data-pc-pie-group]");
    expect(group).not.toBeNull();

    expectPieSectors(container, [{}, {}, {}]);
  });

  it("slices have d attribute (arc paths)", () => {
    const { container } = render(() => (
      <Chart data={pieData} width={400} height={400}>
        <Pie dataKey="value" nameKey="name" />
      </Chart>
    ));

    expectPieSectors(container, [
      { d: expect.any(String) },
      { d: expect.any(String) },
      { d: expect.any(String) },
    ]);
  });

  it("slices have fill colours", () => {
    const { container } = render(() => (
      <Chart data={pieData} width={400} height={400}>
        <Pie dataKey="value" nameKey="name" />
      </Chart>
    ));

    const slices = container.querySelectorAll("[data-pc-pie-slice]");
    for (const slice of slices) {
      const fill = slice.getAttribute("fill");
      expect(fill).toBeTruthy();
      expect(fill).not.toBe("none");
    }
  });

  it("slices have data-key and data-index", () => {
    const { container } = render(() => (
      <Chart data={pieData} width={400} height={400}>
        <Pie dataKey="value" nameKey="name" />
      </Chart>
    ));

    expectPieSectors(container, [
      { key: "A", index: 0 },
      { key: "B", index: 1 },
      { key: "C", index: 2 },
    ]);
  });

  it("renders donut with innerRadius", () => {
    const { container } = render(() => (
      <Chart data={pieData} width={400} height={400}>
        <Pie dataKey="value" nameKey="name" innerRadius="40%" />
      </Chart>
    ));

    expectPieSectors(container, [{}, {}, {}]);
  });

  it("respects custom colors", () => {
    const colors = { A: "#ff0000", B: "#00ff00", C: "#0000ff" };
    const { container } = render(() => (
      <Chart data={pieData} width={400} height={400}>
        <Pie dataKey="value" nameKey="name" colors={colors} />
      </Chart>
    ));

    expectPieSectors(container, [{ fill: "#ff0000" }, { fill: "#00ff00" }, { fill: "#0000ff" }]);
  });

  it("uses per-series data instead of chart data", () => {
    const pieSeriesData = [
      { category: "Coffee", amount: 7 },
      { category: "Tea", amount: 3 },
    ];
    const { container } = render(() => (
      <Chart data={pieData} width={400} height={400}>
        <Pie data={pieSeriesData} dataKey="amount" nameKey="category" />
      </Chart>
    ));

    expectPieSectors(container, [
      { key: "Coffee", index: 0 },
      { key: "Tea", index: 1 },
    ]);
  });

  it("renders default slice labels", () => {
    const { container } = render(() => (
      <Chart data={pieData} width={400} height={400}>
        <Pie dataKey="value" nameKey="name" label />
      </Chart>
    ));

    const labels = container.querySelectorAll("[data-pc-pie-label]");
    expect(labels).toHaveLength(3);
    expect(labels[0]?.textContent).toBe("A");
  });

  it("renders custom slice labels with percentages", () => {
    const { container } = render(() => (
      <Chart data={pieData} width={400} height={400}>
        <Pie
          dataKey="value"
          nameKey="name"
          label={(slice) => (
            <text data-test-pie-label="">{`${slice.name}: ${Math.round(slice.percent * 100)}%`}</text>
          )}
        />
      </Chart>
    ));

    const labels = container.querySelectorAll("[data-test-pie-label]");
    expect(labels).toHaveLength(3);
    expect(labels[0]?.textContent).toBe("A: 30%");
    expect(labels[1]?.textContent).toBe("B: 50%");
  });

  it("reports the source slice for slice interactions", () => {
    const onSliceClick = vi.fn();
    const { container } = render(() => (
      <Chart data={pieData} width={400} height={400}>
        <Pie dataKey="value" nameKey="name" onSliceClick={onSliceClick} />
      </Chart>
    ));

    fireEvent.click(container.querySelectorAll("[data-pc-pie-slice]")[1]!);

    expect(onSliceClick).toHaveBeenCalledOnce();
    expect(onSliceClick.mock.calls[0]?.[0]).toMatchObject({
      name: "B",
      value: 50,
      key: "B",
      index: 1,
      percent: 0.5,
    });
  });
});

describe("Radar", () => {
  it("renders a polygon path with data-pc-radar", () => {
    const { container } = render(() => (
      <Chart data={radarData} width={400} height={400}>
        <PolarLayout>
          <PolarAngleAxis dataKey="cat" />
          <PolarRadiusAxis />
          <Radar dataKey="val" />
        </PolarLayout>
      </Chart>
    ));

    const group = container.querySelector("[data-pc-radar-group]");
    expect(group).not.toBeNull();

    const polygon = container.querySelector("[data-pc-radar]");
    expect(polygon).not.toBeNull();
    expect(polygon?.tagName).toBe("path");
    expect(polygon?.getAttribute("d")).toBeTruthy();
  });

  it("applies fill-opacity", () => {
    const { container } = render(() => (
      <Chart data={radarData} width={400} height={400}>
        <PolarLayout>
          <PolarAngleAxis dataKey="cat" />
          <PolarRadiusAxis />
          <Radar dataKey="val" fillOpacity={0.5} />
        </PolarLayout>
      </Chart>
    ));

    const polygon = container.querySelector("[data-pc-radar]");
    expect(polygon?.getAttribute("fill-opacity")).toBe("0.5");
  });

  it("tweens polygon geometry when data changes", () => {
    let animationId = 0;
    const callbacks = new Map<number, FrameRequestCallback>();
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
      const id = ++animationId;
      callbacks.set(id, callback);
      return id;
    });
    vi.stubGlobal("cancelAnimationFrame", (id: number) => callbacks.delete(id));

    const [values, setValues] = createSignal(radarData);
    const { container } = render(() => (
      <Chart data={values()} width={400} height={400}>
        <PolarLayout>
          <PolarAngleAxis dataKey="cat" />
          <PolarRadiusAxis />
          <Radar dataKey="val" animation={{ enabled: true, duration: 100 }} />
        </PolarLayout>
      </Chart>
    ));

    const path = container.querySelector("[data-pc-radar]")!;
    const before = path.getAttribute("d");
    setValues(radarData.map((datum) => ({ ...datum, val: datum.val / 2 })));

    for (const [id, callback] of Array.from(callbacks)) {
      callbacks.delete(id);
      callback(0);
    }
    for (const [id, callback] of Array.from(callbacks)) {
      callbacks.delete(id);
      callback(101);
    }

    expect(container.querySelector("[data-pc-radar]")?.getAttribute("d")).not.toBe(before);
  });
});

describe("RadialBar", () => {
  it("renders one sector per datum using a numeric angle axis", () => {
    const { container } = render(() => (
      <Chart data={pieData} width={400} height={400}>
        <PolarLayout innerRadius="20%" outerRadius="80%">
          <PolarAngleAxis type="linear" axisRange={[0, 100]} />
          <RadialBar dataKey="value" />
        </PolarLayout>
      </Chart>
    ));

    const bars = container.querySelectorAll("[data-pc-radial-bar]");
    expect(bars).toHaveLength(3);
    expect(bars[0]?.tagName).toBe("path");
    expect(bars[0]?.getAttribute("d")).toBeTruthy();
  });

  it("renders background tracks and reports per-bar events", () => {
    const onPointClick = vi.fn();
    const { container } = render(() => (
      <Chart data={pieData} width={400} height={400}>
        <PolarLayout>
          <PolarAngleAxis type="linear" axisRange={[0, 100]} />
          <RadialBar dataKey="value" background onPointClick={onPointClick} />
        </PolarLayout>
      </Chart>
    ));

    expect(container.querySelectorAll("[data-pc-radial-bar-background]")).toHaveLength(3);
    fireEvent.click(container.querySelectorAll("[data-pc-radial-bar]")[1]!);
    expect(onPointClick).toHaveBeenCalledWith(
      expect.objectContaining({ value: 50, index: 1, point: expect.any(Array) }),
      expect.any(MouseEvent),
    );
  });

  it("renders custom labels", () => {
    const { container } = render(() => (
      <Chart data={pieData} width={400} height={400}>
        <PolarLayout>
          <PolarAngleAxis type="linear" axisRange={[0, 100]} />
          <RadialBar
            dataKey="value"
            label={(bar) => <text data-test-radial-label="">{`${bar.value}%`}</text>}
          />
        </PolarLayout>
      </Chart>
    ));

    const labels = container.querySelectorAll("[data-test-radial-label]");
    expect(labels).toHaveLength(3);
    expect(labels[1]?.textContent).toBe("50%");
  });

  it("tweens angular spans when values change", () => {
    let animationId = 0;
    const callbacks = new Map<number, FrameRequestCallback>();
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
      const id = ++animationId;
      callbacks.set(id, callback);
      return id;
    });
    vi.stubGlobal("cancelAnimationFrame", (id: number) => callbacks.delete(id));

    const [values, setValues] = createSignal(pieData);
    const { container } = render(() => (
      <Chart data={values()} width={400} height={400}>
        <PolarLayout>
          <PolarAngleAxis type="linear" axisRange={[0, 100]} />
          <RadialBar dataKey="value" animation={{ enabled: true, duration: 100 }} />
        </PolarLayout>
      </Chart>
    ));

    const runFrame = (time: number) => {
      for (const [id, callback] of Array.from(callbacks)) {
        callbacks.delete(id);
        callback(time);
      }
    };
    const initialStart = performance.now();
    runFrame(initialStart);
    runFrame(initialStart + 101);

    const path = container.querySelectorAll("[data-pc-radial-bar]")[0]!;
    const before = path.getAttribute("d");
    setValues(pieData.map((datum) => ({ ...datum, value: datum.value / 2 })));
    const updateStart = performance.now();
    runFrame(updateStart);
    runFrame(updateStart + 101);

    expect(container.querySelectorAll("[data-pc-radial-bar]")[0]?.getAttribute("d")).not.toBe(
      before,
    );
  });
});
