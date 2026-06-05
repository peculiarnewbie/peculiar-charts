import { useChartContext } from '@src/components/context'
import {
  type AnimationOptions,
  type ResolvedAnimationOptions,
  createPresence,
  resolveAnimation,
} from '@src/lib/animation'
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
    /** Data key for stable slice identity and palette assignment. @defaultValue `nameKey` */
    colorKey?: string
    /** Explicit fill colours — map by `colorKey` value or callback. */
    colors?: Record<string, string> | ((key: string) => string | undefined)
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
    /** Animation configuration. */
    animation?: AnimationOptions
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
    'colorKey',
    'colors',
    'innerRadius',
    'outerRadius',
    'cornerRadius',
    'padAngle',
    'startAngle',
    'endAngle',
    'animation',
  ])
  const chartContext = useChartContext()

  const colorIndexByKey = new Map<string, number>()
  let nextPaletteIndex = 0

  const paletteIndexFor = (key: string) => {
    let index = colorIndexByKey.get(key)
    if (index === undefined) {
      index = nextPaletteIndex++
      colorIndexByKey.set(key, index)
    }
    return index
  }

  const sliceColor = (key: string) => {
    const colors = localProps.colors
    if (colors) {
      if (typeof colors === 'function') {
        const color = colors(key)
        if (color !== undefined) return color
      } else if (colors[key] !== undefined) {
        return colors[key]!
      }
    }
    return paletteColor(paletteIndexFor(key))
  }

  const sliceId = (key: string) => `${pieId}-${key}`

  const values = createMemo(() =>
    accessData<number>(chartContext.data(), localProps.dataKey),
  )
  const names = createMemo(() =>
    localProps.nameKey
      ? accessData<any>(chartContext.data(), localProps.nameKey)
      : values().map((_, i) => `Slice ${i + 1}`),
  )
  const colorKeys = createMemo(() => {
    if (localProps.colorKey) {
      return accessData<any>(chartContext.data(), localProps.colorKey).map(
        String,
      )
    }
    if (localProps.nameKey) return names().map(String)
    return values().map((_, i) => String(i))
  })

  // Register every slice as a series so the legend lists & toggles them.
  createEffect(() => {
    const _names = names()
    const _keys = colorKeys()
    _keys.forEach((key, i) =>
      chartContext.registerSeriesMeta(sliceId(key), {
        name: String(_names[i]),
        type: 'pie',
        color: sliceColor(key),
      }),
    )
    onCleanup(() =>
      _keys.forEach((key) =>
        chartContext.unregisterSeriesMeta(sliceId(key)),
      ),
    )
  })

  const colorOf = (id: string, key: string) =>
    chartContext.seriesMeta().find((s) => s.id === id)?.color ??
    sliceColor(key)

  const layout = createMemo(() => {
    const _values = values()
    const _keys = colorKeys()

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
        key: _keys[index]!,
        id: sliceId(_keys[index]!),
      }))
      .filter((s) => chartContext.isSeriesVisible(s.id))

    const pieGen = d3pie<(typeof slices)[number]>()
      .value((d) => d.value)
      .sort(null)
      .startAngle(localProps.startAngle)
      .endAngle(localProps.endAngle)
      .padAngle(localProps.padAngle)

    return {
      cx,
      cy,
      innerR,
      outerR,
      slices: pieGen(slices).map((a) => ({
        startAngle: a.startAngle,
        endAngle: a.endAngle,
        id: a.data.id,
        index: a.data.index,
        key: a.data.key,
      })),
    }
  })

  const animOpts = createMemo<ResolvedAnimationOptions>(() =>
    resolveAnimation(localProps.animation),
  )
  const animatedSlices = createPresence(
    () => layout().slices,
    animOpts,
    (a, b, t) => ({
      startAngle: a.startAngle + (b.startAngle - a.startAngle) * t,
      endAngle: a.endAngle + (b.endAngle - a.endAngle) * t,
      id: b.id,
      index: b.index,
      key: b.key,
    }),
    (target) => ({
      startAngle: target.startAngle,
      endAngle: target.startAngle,
      id: target.id,
      index: target.index,
      key: target.key,
    }),
    (current) => ({
      startAngle: current.startAngle,
      endAngle: current.startAngle,
      id: current.id,
      index: current.index,
      key: current.key,
    }),
  )
  const animatedLayout = createMemo(() => {
    const { cx, cy, innerR, outerR } = layout()
    const arcGen = d3arc<{ startAngle: number; endAngle: number }>()
      .innerRadius(innerR)
      .outerRadius(outerR)
      .cornerRadius(localProps.cornerRadius)
    return {
      cx,
      cy,
      slices: animatedSlices().map((item) => ({
        d: arcGen(item.value) ?? '',
        id: item.value.id,
        index: item.value.index,
        key: item.value.key,
        mode: item.mode,
      })),
    }
  })

  return (
    <g
      data-pc-pie-group=""
      transform={`translate(${animatedLayout().cx}, ${animatedLayout().cy})`}
    >
      <For each={animatedLayout().slices}>
        {(slice) => (
          <path
            d={slice.d}
            fill={colorOf(slice.id, slice.key)}
            data-pc-pie-slice=""
            data-index={slice.index}
            data-key={slice.key}
            {...otherProps}
          />
        )}
      </For>
    </g>
  )
}

export default Pie
