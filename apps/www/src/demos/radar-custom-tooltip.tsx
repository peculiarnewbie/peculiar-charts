import {
  Chart,
  PolarAngleAxis,
  PolarAngleLabel,
  PolarCrosshair,
  PolarGrid,
  PolarLayout,
  PolarRadiusAxis,
  PolarTooltip,
  Radar,
  type TooltipPayload,
} from 'peculiar-charts'
import { radarSkills } from '../data'

/** Custom `content` renderer — same `TooltipPayload` as cartesian tooltips. */
export default function RadarCustomTooltipDemo() {
  return (
    <Chart data={radarSkills} inset={24}>
      <PolarLayout outerRadius="75%">
        <PolarAngleAxis dataKey="skill">
          <PolarAngleLabel class="fill-zinc-600 text-[10px]" />
          <PolarCrosshair class="stroke-zinc-400" />
          <PolarTooltip
            class="rounded-lg border border-zinc-200 bg-white px-2 py-1 text-xs shadow-lg"
            content={(p: TooltipPayload) => (
              <div>
                <strong>{String(p.label)}</strong>
                <ul class="mt-1 space-y-0.5">
                  {p.series.map((s) => (
                    <li style={{ color: s.color }}>
                      {s.name}: {String(s.value)}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          />
        </PolarAngleAxis>
        <PolarRadiusAxis tickCount={4}>
          <PolarGrid class="stroke-zinc-300" stroke-width={1} />
        </PolarRadiusAxis>
        <Radar dataKey="alice" name="Alice" class="text-violet-500" color="#8b5cf6" fillOpacity={0.2} />
        <Radar dataKey="bob" name="Bob" class="text-emerald-500" color="#10b981" fillOpacity={0.15} />
      </PolarLayout>
    </Chart>
  )
}
