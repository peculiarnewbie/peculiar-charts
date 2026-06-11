import { Chart, Legend, Pie } from "peculiar-charts";
import { sales } from "../data";

export default function PieDemo() {
  return (
    <Chart data={sales}>
      <Legend class="text-xs" />
      <Pie dataKey="coffee" nameKey="day" padAngle={0.01} cornerRadius={2} />
    </Chart>
  );
}
