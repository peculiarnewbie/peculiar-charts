import {
  Axis,
  AxisGrid,
  AxisLabel,
  AxisLine,
  Chart,
  Rectangle,
  projectScale,
  useData,
  usePlotArea,
  useXScale,
  useYScale,
} from "peculiar-charts";
import { For, createMemo } from "solid-js";

type Span = {
  lane: string;
  start: number;
  end: number;
  label: string;
  color: string;
};

const spans: Span[] = [
  { lane: "UI", start: 0, end: 7, label: "Frame", color: "#3b82f6" },
  { lane: "CPU", start: 2, end: 13, label: "Layout", color: "#8b5cf6" },
  { lane: "CPU", start: 15, end: 22, label: "Paint", color: "#8b5cf6" },
  { lane: "GPU", start: 8, end: 20, label: "Submit", color: "#10b981" },
];

function Intervals() {
  const data = useData<Span[]>();
  const x = useXScale();
  const y = useYScale();
  const plot = usePlotArea();
  const lanes = createMemo(() => [...new Set(data().map((span) => span.lane))]);
  const laneHeight = () => plot().height / Math.max(1, lanes().length);

  return (
    <g aria-label="Trace intervals" data-demo-intervals="">
      <For each={data()}>
        {(span) => {
          const left = () => projectScale(x(), span.start);
          const right = () => projectScale(x(), span.end);
          const centerY = () => projectScale(y(), span.lane);

          return (
            <Rectangle
              x={Math.min(left(), right())}
              y={centerY() - laneHeight() * 0.35}
              width={Math.max(1, Math.abs(right() - left()))}
              height={laneHeight() * 0.7}
              rx={3}
              fill={span.color}
            >
              <title>{span.label}</title>
            </Rectangle>
          );
        }}
      </For>
    </g>
  );
}

export default function IntervalTimeline() {
  return (
    <Chart data={spans}>
      <Axis axis="x" position="bottom" type="linear" axisRange={[0, 24]}>
        <AxisLabel format={(value) => String(value) + " ms"} />
        <AxisLine />
        <AxisGrid class="stroke-black/10" />
      </Axis>
      <Axis dataKey="lane" axis="y" position="left" type="point">
        <AxisLabel />
      </Axis>
      <Intervals />
    </Chart>
  );
}
