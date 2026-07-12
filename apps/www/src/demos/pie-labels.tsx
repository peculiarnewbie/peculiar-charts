import { Chart, Pie } from "peculiar-charts";
import { sales } from "../data";

export default function PieLabelsDemo() {
  return (
    <Chart data={sales}>
      <Pie
        dataKey="coffee"
        nameKey="day"
        innerRadius="45%"
        padAngle={0.02}
        labelPosition="outside"
        label={(slice) => (
          <text
            x={slice.point[0]}
            y={slice.point[1]}
            text-anchor={slice.textAnchor}
            dominant-baseline="middle"
            class="fill-zinc-600 text-[10px]"
          >
            {`${slice.name} ${Math.round(slice.percent * 100)}%`}
          </text>
        )}
      />
    </Chart>
  );
}
