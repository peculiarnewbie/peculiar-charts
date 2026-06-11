import {
  Axis,
  AxisGrid,
  AxisLabel,
  AxisLine,
  Chart,
  Curve,
  Legend,
  Line,
  type LineShapeProps,
} from "peculiar-charts";

const data = [
  { day: "Mon", coffee: 4, tea: 3 },
  { day: "Tue", coffee: 3, tea: 5 },
  { day: "Wed", coffee: 5, tea: 2 },
  { day: "Thu", coffee: 2, tea: 4 },
  { day: "Fri", coffee: 6, tea: 3 },
  { day: "Sat", coffee: 4, tea: 6 },
  { day: "Sun", coffee: 3, tea: 4 },
];

function OpacityFadeShape(props: LineShapeProps) {
  const { animationElapsedTime = 1, isEntrance = false, points, ...svgProps } = props;
  const opacity = isEntrance ? animationElapsedTime : 1;
  return <Curve points={points} stroke-opacity={opacity} {...svgProps} />;
}

export default function CustomShapeLine() {
  return (
    <Chart data={data}>
      <Legend class="text-xs" />
      <Line
        dataKey="coffee"
        name="Coffee"
        shape={OpacityFadeShape}
        animation={{ duration: 800 }}
        stroke="#3b82f6"
        stroke-width={2}
        class="text-blue-500"
        color="#3b82f6"
      />
      <Line
        dataKey="tea"
        name="Tea"
        shape={OpacityFadeShape}
        animation={{ duration: 800 }}
        stroke="#10b981"
        stroke-width={2}
        class="text-emerald-500"
        color="#10b981"
      />
      <Axis dataKey="day" axis="x" position="bottom" type="point">
        <AxisLabel />
        <AxisGrid class="stroke-black/10" />
      </Axis>
      <Axis axis="y" position="left" type="linear" tickCount={5}>
        <AxisLabel />
        <AxisLine class="stroke-black" />
      </Axis>
    </Chart>
  );
}
