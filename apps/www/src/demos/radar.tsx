import {
  Chart,
  Legend,
  PolarAngleAxis,
  PolarAngleLabel,
  PolarCrosshair,
  PolarGrid,
  PolarLayout,
  PolarRadiusAxis,
  PolarRadiusLabel,
  PolarTooltip,
  Radar,
} from 'peculiar-charts'
import { TOOLTIP_SHELL } from '../demoStyles'
import { radarSkills } from '../data'

export default function RadarDemo() {
  return (
    <Chart data={radarSkills} inset={24}>
      <Legend class="text-xs" />
      <PolarLayout outerRadius="75%">
        <PolarAngleAxis dataKey="skill">
          <PolarAngleLabel class="fill-zinc-600 text-[10px]" />
          <PolarCrosshair stroke-dasharray="4,4" class="stroke-zinc-400/80" />
          <PolarTooltip class={TOOLTIP_SHELL} />
        </PolarAngleAxis>
        <PolarRadiusAxis tickCount={4}>
          <PolarGrid class="stroke-zinc-300" stroke-width={1} />
          <PolarRadiusLabel class="fill-zinc-500 text-[9px]" />
        </PolarRadiusAxis>
        <Radar
          dataKey="alice"
          name="Alice"
          class="text-violet-500"
          stroke-width={2}
          fillOpacity={0.25}
        />
        <Radar
          dataKey="bob"
          name="Bob"
          class="text-emerald-500"
          stroke-width={2}
          fillOpacity={0.2}
        />
      </PolarLayout>
    </Chart>
  )
}
