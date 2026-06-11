import { describe, expect, it } from "vitest";
import { render } from "@solidjs/testing-library";
import Chart from "@src/components/Chart";
import Line from "@src/series/Line";
import Bar from "@src/series/Bar";
import Pie from "@src/series/Pie";
import Area from "@src/series/Area";
import Point from "@src/series/Point";
import Bubble from "@src/series/Bubble";
import Radar from "@src/series/Radar";
import Axis from "@src/axis/Axis";
import PolarLayout from "@src/axis/polar/PolarLayout";
import PolarAngleAxis from "@src/axis/polar/PolarAngleAxis";
import PolarRadiusAxis from "@src/axis/polar/PolarRadiusAxis";
import {
  cartesianData,
  cartesianNumericData,
  bubbleData,
  pieData,
  radarData,
  multiSeriesData,
} from "./helpers/_data";

function serializeSvg(container: Element): string {
  const svg = container.querySelector("[data-pc-chart]");
  if (!svg) throw new Error("No [data-pc-chart] element found");

  let svgString = svg.outerHTML;

  if (!svgString.includes('xmlns="http://www.w3.org/2000/svg"')) {
    svgString = svgString.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"');
  }

  return svgString;
}

describe("image snapshots: Line", () => {
  it("renders consistently", () => {
    const { container } = render(() => (
      <Chart data={cartesianData} width={400} height={300}>
        <Axis axis="x" position="bottom" dataKey="x" />
        <Axis axis="y" position="left" />
        <Line dataKey="y" />
      </Chart>
    ));

    expect(serializeSvg(container)).toMatchImageSnapshot();
  });
});

describe("image snapshots: Area", () => {
  it("renders consistently", () => {
    const { container } = render(() => (
      <Chart data={cartesianData} width={400} height={300}>
        <Axis axis="x" position="bottom" dataKey="x" />
        <Axis axis="y" position="left" />
        <Area dataKey="y" />
      </Chart>
    ));

    expect(serializeSvg(container)).toMatchImageSnapshot();
  });

  it("renders with custom fill and stroke", () => {
    const { container } = render(() => (
      <Chart data={cartesianData} width={400} height={300}>
        <Axis axis="x" position="bottom" dataKey="x" />
        <Axis axis="y" position="left" />
        <Area dataKey="y" fill="#e74c3c" fillOpacity={0.3} stroke="#c0392b" />
      </Chart>
    ));

    expect(serializeSvg(container)).toMatchImageSnapshot();
  });

  it("renders stacked areas", () => {
    const { container } = render(() => (
      <Chart data={multiSeriesData} width={400} height={300}>
        <Axis axis="x" position="bottom" dataKey="x" />
        <Axis axis="y" position="left" />
        <Area dataKey="y1" stackId="stack" />
        <Area dataKey="y2" stackId="stack" />
      </Chart>
    ));

    expect(serializeSvg(container)).toMatchImageSnapshot();
  });
});

describe("image snapshots: Point", () => {
  it("renders consistently", () => {
    const { container } = render(() => (
      <Chart data={cartesianData} width={400} height={300}>
        <Axis axis="x" position="bottom" dataKey="x" />
        <Axis axis="y" position="left" />
        <Point dataKey="y" />
      </Chart>
    ));

    expect(serializeSvg(container)).toMatchImageSnapshot();
  });

  it("renders with custom radius", () => {
    const { container } = render(() => (
      <Chart data={cartesianData} width={400} height={300}>
        <Axis axis="x" position="bottom" dataKey="x" />
        <Axis axis="y" position="left" />
        <Point dataKey="y" r={8} fill="#9b59b6" />
      </Chart>
    ));

    expect(serializeSvg(container)).toMatchImageSnapshot();
  });
});

describe("image snapshots: Bubble", () => {
  it("renders consistently", () => {
    const { container } = render(() => (
      <Chart data={bubbleData} width={400} height={300}>
        <Axis axis="x" position="bottom" dataKey="x" />
        <Axis axis="y" position="left" />
        <Bubble dataKey="y" sizeKey="z" />
      </Chart>
    ));

    expect(serializeSvg(container)).toMatchImageSnapshot();
  });

  it("renders with custom size range", () => {
    const { container } = render(() => (
      <Chart data={bubbleData} width={400} height={300}>
        <Axis axis="x" position="bottom" dataKey="x" />
        <Axis axis="y" position="left" />
        <Bubble dataKey="y" sizeKey="z" sizeRange={[6, 30]} fill="#e67e22" />
      </Chart>
    ));

    expect(serializeSvg(container)).toMatchImageSnapshot();
  });
});

describe("image snapshots: Radar", () => {
  it("renders consistently", () => {
    const { container } = render(() => (
      <Chart data={radarData} width={400} height={400}>
        <PolarLayout>
          <PolarAngleAxis dataKey="cat" />
          <PolarRadiusAxis />
          <Radar dataKey="val" />
        </PolarLayout>
      </Chart>
    ));

    expect(serializeSvg(container)).toMatchImageSnapshot();
  });

  it("renders with custom fill opacity", () => {
    const { container } = render(() => (
      <Chart data={radarData} width={400} height={400}>
        <PolarLayout>
          <PolarAngleAxis dataKey="cat" />
          <PolarRadiusAxis />
          <Radar dataKey="val" fill="#3498db" fillOpacity={0.4} stroke="#2980b9" />
        </PolarLayout>
      </Chart>
    ));

    expect(serializeSvg(container)).toMatchImageSnapshot();
  });

  it("renders multiple radars", () => {
    const radarData2 = [
      { cat: "A", val1: 80, val2: 60 },
      { cat: "B", val1: 60, val2: 80 },
      { cat: "C", val1: 90, val2: 50 },
      { cat: "D", val1: 70, val2: 90 },
    ];
    const { container } = render(() => (
      <Chart data={radarData2} width={400} height={400}>
        <PolarLayout>
          <PolarAngleAxis dataKey="cat" />
          <PolarRadiusAxis />
          <Radar dataKey="val1" fill="#e74c3c" fillOpacity={0.3} stroke="#e74c3c" />
          <Radar dataKey="val2" fill="#3498db" fillOpacity={0.3} stroke="#3498db" />
        </PolarLayout>
      </Chart>
    ));

    expect(serializeSvg(container)).toMatchImageSnapshot();
  });
});

describe("image snapshots: Multi-series combos", () => {
  it("Area + Line overlay", () => {
    const { container } = render(() => (
      <Chart data={cartesianData} width={400} height={300}>
        <Axis axis="x" position="bottom" dataKey="x" />
        <Axis axis="y" position="left" />
        <Area dataKey="y" fillOpacity={0.2} />
        <Line dataKey="y" stroke="#e74c3c" />
      </Chart>
    ));

    expect(serializeSvg(container)).toMatchImageSnapshot();
  });

  it("multi-line", () => {
    const { container } = render(() => (
      <Chart data={multiSeriesData} width={400} height={300}>
        <Axis axis="x" position="bottom" dataKey="x" />
        <Axis axis="y" position="left" />
        <Line dataKey="y1" stroke="#e74c3c" />
        <Line dataKey="y2" stroke="#3498db" />
      </Chart>
    ));

    expect(serializeSvg(container)).toMatchImageSnapshot();
  });

  it("stacked bars", () => {
    const { container } = render(() => (
      <Chart data={multiSeriesData} width={400} height={300}>
        <Axis axis="x" position="bottom" dataKey="x" />
        <Axis axis="y" position="left" />
        <Bar dataKey="y1" stackId="stack" fill="#e74c3c" />
        <Bar dataKey="y2" stackId="stack" fill="#3498db" />
      </Chart>
    ));

    expect(serializeSvg(container)).toMatchImageSnapshot();
  });

  it("grouped bars", () => {
    const { container } = render(() => (
      <Chart data={multiSeriesData} width={400} height={300}>
        <Axis axis="x" position="bottom" dataKey="x" />
        <Axis axis="y" position="left" />
        <Bar dataKey="y1" fill="#e74c3c" />
        <Bar dataKey="y2" fill="#3498db" />
      </Chart>
    ));

    expect(serializeSvg(container)).toMatchImageSnapshot();
  });
});

describe("image snapshots: Size variations", () => {
  it("small chart (200x150)", () => {
    const { container } = render(() => (
      <Chart data={cartesianData} width={200} height={150}>
        <Axis axis="x" position="bottom" dataKey="x" />
        <Axis axis="y" position="left" />
        <Line dataKey="y" />
      </Chart>
    ));

    expect(serializeSvg(container)).toMatchImageSnapshot();
  });

  it("large chart (800x600)", () => {
    const { container } = render(() => (
      <Chart data={cartesianData} width={800} height={600}>
        <Axis axis="x" position="bottom" dataKey="x" />
        <Axis axis="y" position="left" />
        <Bar dataKey="y" />
      </Chart>
    ));

    expect(serializeSvg(container)).toMatchImageSnapshot();
  });

  it("wide aspect ratio (600x200)", () => {
    const { container } = render(() => (
      <Chart data={cartesianData} width={600} height={200}>
        <Axis axis="x" position="bottom" dataKey="x" />
        <Axis axis="y" position="left" />
        <Line dataKey="y" />
      </Chart>
    ));

    expect(serializeSvg(container)).toMatchImageSnapshot();
  });

  it("tall aspect ratio (200x600)", () => {
    const { container } = render(() => (
      <Chart data={cartesianData} width={200} height={600}>
        <Axis axis="x" position="bottom" dataKey="x" />
        <Axis axis="y" position="left" />
        <Bar dataKey="y" />
      </Chart>
    ));

    expect(serializeSvg(container)).toMatchImageSnapshot();
  });

  it("numeric x-axis with more data points", () => {
    const { container } = render(() => (
      <Chart data={cartesianNumericData} width={500} height={300}>
        <Axis axis="x" position="bottom" dataKey="x" />
        <Axis axis="y" position="left" />
        <Line dataKey="y" stroke="#2ecc71" stroke-width={2} />
        <Point dataKey="y" r={4} fill="#2ecc71" />
      </Chart>
    ));

    expect(serializeSvg(container)).toMatchImageSnapshot();
  });
});

describe("image snapshots: Bar", () => {
  it("renders consistently", () => {
    const { container } = render(() => (
      <Chart data={cartesianData} width={400} height={300}>
        <Axis axis="x" position="bottom" dataKey="x" />
        <Axis axis="y" position="left" />
        <Bar dataKey="y" />
      </Chart>
    ));

    expect(serializeSvg(container)).toMatchImageSnapshot();
  });

  it("renders with custom fill", () => {
    const { container } = render(() => (
      <Chart data={cartesianData} width={400} height={300}>
        <Axis axis="x" position="bottom" dataKey="x" />
        <Axis axis="y" position="left" />
        <Bar dataKey="y" fill="#3498db" />
      </Chart>
    ));

    expect(serializeSvg(container)).toMatchImageSnapshot();
  });
});

describe("image snapshots: Pie", () => {
  it("renders consistently", () => {
    const { container } = render(() => (
      <Chart data={pieData} width={400} height={400}>
        <Pie dataKey="value" nameKey="name" />
      </Chart>
    ));

    expect(serializeSvg(container)).toMatchImageSnapshot();
  });

  it("renders donut variant", () => {
    const { container } = render(() => (
      <Chart data={pieData} width={400} height={400}>
        <Pie dataKey="value" nameKey="name" innerRadius="40%" />
      </Chart>
    ));

    expect(serializeSvg(container)).toMatchImageSnapshot();
  });

  it("renders with custom colors", () => {
    const colors = { A: "#e74c3c", B: "#2ecc71", C: "#3498db" };
    const { container } = render(() => (
      <Chart data={pieData} width={400} height={400}>
        <Pie dataKey="value" nameKey="name" colors={colors} />
      </Chart>
    ));

    expect(serializeSvg(container)).toMatchImageSnapshot();
  });
});
