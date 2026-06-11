import { Chart, Legend, Pie } from "peculiar-charts";
import { sales } from "../data";

export default function DonutDemo() {
  return (
    <Chart data={sales}>
      <Legend class="text-xs" />
      <Pie dataKey="coffee" nameKey="day" innerRadius="60%" padAngle={0.015} cornerRadius={3} />
    </Chart>
  );
}
