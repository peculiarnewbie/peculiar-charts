import { useChartContext } from '@src/components/context'
import { paletteColor } from '@src/lib/palette'
import type { OverrideProps } from '@src/lib/types'
import { accessData } from '@src/lib/utils'
import { arc as d3arc, pie as d3pie } from 'd3-shape'
import {
  type ComponentProps,
  For,
  createEffect,
  createMemo,
  createUniqueId,
  mergeProps,
  onCleanup,
  splitProps,
} from 'solid-js'

export type PieProps = OverrideProps<
  Omit<ComponentProps<'path'>, 'd'>,
  {
    /** Data key for slice values. Omit for a plain number array. */
    dataKey?: string
    /** Data key for slice names (legend/labels). */
    nameKey?: string
    /** Inner radius — `0` for a pie, `> 0` (px or `%` of radius) for a donut. */
    innerRadius?: number | `${number}%`
    /** Outer radius as px or `%` of the available radius. @defaultValue `'100%'` */
    outerRadius?: number | `${number}%`
    /** Rounded corner radius for slices in px. */
    cornerRadius?: number
    /** Angular padding between slices in radians. */
    padAngle?: number
    /** Start angle of the pie in radians. @defaultValue `0` */
    startAngle?: number
    /** End angle of the pie in radians. @defaultValue `2π` */
    endAngle?: number
  }
>

const resolveRadius = (
  value: number | `${number}%`,
  available: number,
): number =>
  typeof value === 'number'
    ? value
    : (Number.parseFloat(value) / 100) * available

/** Pie / donut series. Self-contained — needs no axes. Each slice is registered
 * with the chart so it appears in `<Legend>` and can be toggled.
 *
 * @data `data-pc-pie-group` - Present on the pie group element.
 * @data `data-pc-pie-slice` - Present on every slice path element.
 */
const Pie = (props: PieProps) => {
  const pieId = createUniqueId()
  const defaultedProps = mergeProps(
    {
      innerRadius: 0,
      outerRadius: '100%' as const,
      cornerRadius: 0,
      padAngle: 0,
      startAngle: 0,
      endAngle: Math.PI * 2,
      stroke: 'none',
    },
    props,
  )
  const [localProps, otherProps] = splitProps(defaultedProps, [
    'dataKey',
    'nameKey',
    'innerRadius',
    'outerRadius',
    'cornerRadius',
    'padAngle',
    'startAngle',
    'endAngle',
  ])
  const chartContext = useChartContext()

  const sliceId = (index: number) => `${pieId}-${index}`

  const values = createMemo(() =>
    accessData<number>(chartContext.data(), localProps.dataKey),
  )
  const names = createMemo(() =>
    localProps.nameKey
      ? accessData<any>(chartContext.data(), localProps.nameKey)
      : values().map((_, i) => `Slice ${i + 1}`),
  )

  // Register every slice as a series so the legend lists & toggles them.
  createEffect(() => {
    const _names = names()
    _names.forEach((name, i) =>
      chartContext.registerSeriesMeta(sliceId(i), {
        name: String(name),
        type: 'pie',
      }),
    )
    onCleanup(() =>
      _names.forEach((_, i) => chartContext.unregisterSeriesMeta(sliceId(i))),
    )
  })

  const colorOf = (id: string, fallbackIndex: number) =>
    chartContext.seriesMeta().find((s) => s.id === id)?.color ??
    paletteColor(fallbackIndex)

  const layout = createMemo(() => {
    const _values = values()

    const left = chartContext.getInset('left')
    const right = chartContext.width() - chartContext.getInset('right')
    const top = chartContext.getInset('top')
    const bottom = chartContext.height() - chartContext.getInset('bottom')

    const cx = (left + right) / 2
    const cy = (top + bottom) / 2
    const available = Math.max(0, Math.min(right - left, bottom - top) / 2)
    const outerR = resolveRadius(localProps.outerRadius, available)
    const innerR = resolveRadius(localProps.innerRadius, outerR)

    const slices = _values
      .map((value, index) => ({
        value: typeof value === 'number' && value > 0 ? value : 0,
        index,
        id: sliceId(index),
      }))
      .filter((s) => chartContext.isSeriesVisible(s.id))

    const pieGen = d3pie<(typeof slices)[number]>()
      .value((d) => d.value)
      .sort(null)
      .startAngle(localProps.startAngle)
      .endAngle(localProps.endAngle)
      .padAngle(localProps.padAngle)

    const arcGen = d3arc<ReturnType<typeof pieGen>[number]>()
      .innerRadius(innerR)
      .outerRadius(outerR)
      .cornerRadius(localProps.cornerRadius)

    return {
      cx,
      cy,
      slices: pieGen(slices).map((a) => ({
        d: arcGen(a) ?? '',
        id: a.data.id,
        index: a.data.index,
      })),
    }
  })

  return (
    <g
      data-pc-pie-group=""
      transform={`translate(${layout().cx}, ${layout().cy})`}
    >
      <For each={layout().slices}>
        {(slice) => (
          <path
            d={slice.d}
            fill={colorOf(slice.id, slice.index)}
            data-pc-pie-slice=""
            data-index={slice.index}
            {...otherProps}
          />
        )}
      </For>
    </g>
  )
}

export default Pie
