import { dataIf } from '@corvu/utils'
import { useChartContext } from '@src/components/context'
import {
  type AnimationOptions,
  type ResolvedAnimationOptions,
  createPresence,
  resolveAnimation,
} from '@src/lib/animation'
import createClosestTick from '@src/lib/createClosestTick'
import createPoints from '@src/lib/createPoints'
import createScale from '@src/lib/createScale'
import createSeries from '@src/lib/createSeries'
import { type PointEvents, pointEvents } from '@src/lib/markers'
import type { OverrideProps } from '@src/lib/types'
import { accessData, axisValues, pointDefined } from '@src/lib/utils'
import {
  type ComponentProps,
  For,
  type JSX,
  Show,
  createMemo,
  createUniqueId,
  mergeProps,
  splitProps,
} from 'solid-js'

/** A point's pixel position plus the datum it came from. */
export type PointDatum = {
  point: [number, number]
  value: number
  index: number
  active: boolean
}

export type PointProps = OverrideProps<
  Omit<ComponentProps<'circle'>, 'cx' | 'cy'>,
  {
    /** Data key for the y-values. Omit for plain number arrays. */
    dataKey?: string
    /** Display name for legends/tooltips. @defaultValue `dataKey` */
    name?: string
    /** Bound x-axis id. @defaultValue `'x'` */
    xAxisId?: string
    /** Bound value-axis id. @defaultValue `'y'` */
    yAxisId?: string
    /** Stack id — series sharing one stack are stacked. */
    stackId?: string
    /** `<circle>` props applied when the point is the active (hovered) one. */
    activeProps?: Omit<ComponentProps<'circle'>, 'cx' | 'cy'>
    /** Render a custom marker per point (e.g. an image or emoji) instead of a
     * `<circle>`. Receives the point's pixel position, value and active state. */
    children?: (datum: PointDatum) => JSX.Element
    /** Animation configuration. */
    animation?: AnimationOptions
  } & PointEvents
>

/** Point (marker) series.
 *
 * @data `data-pc-point-group` - Present on every point group element.
 * @data `data-pc-point` - Present on every point circle element.
 */
const Point = (props: PointProps) => {
  const seriesId = createUniqueId()
  const defaultedProps = mergeProps(
    { xAxisId: 'x', yAxisId: 'y', r: 4, fill: 'currentColor' },
    props,
  )
  const [localProps, eventProps, otherProps] = splitProps(
    defaultedProps,
    [
      'dataKey',
      'name',
      'xAxisId',
      'yAxisId',
      'stackId',
      'activeProps',
      'children',
      'animation',
    ],
    ['onPointClick', 'onPointEnter', 'onPointLeave'],
  )
  const chartContext = useChartContext()

  const data = createMemo(() =>
    accessData<number>(chartContext.data(), localProps.dataKey),
  )

  createSeries({
    seriesId,
    name: () => localProps.name ?? localProps.dataKey ?? 'series',
    type: 'point',
    yAxisId: () => localProps.yAxisId,
    dataKey: () => localProps.dataKey,
    stackId: () => localProps.stackId,
    data,
    chartContext,
  })

  const points = createPoints({
    xAxisId: () => localProps.xAxisId,
    yAxisId: () => localProps.yAxisId,
    dataKey: () => localProps.dataKey,
    stackId: () => localProps.stackId,
    data,
    chartContext,
  })

  const xScale = createScale({
    axisId: () => localProps.xAxisId,
    orientation: () => 'x',
    chartContext,
  })

  const closestTick = createClosestTick({
    axis: () => 'x',
    scale: xScale,
    values: () => axisValues(chartContext, localProps.xAxisId, 'x'),
    chartContext,
  })

  const isActive = (index: number) =>
    chartContext.pointerInChart() && closestTick()?.index === index

  const circleProps = (index: number) =>
    isActive(index)
      ? mergeProps(otherProps, localProps.activeProps)
      : otherProps

  const animOpts = createMemo<ResolvedAnimationOptions>(() =>
    resolveAnimation(localProps.animation),
  )
  const circles = createMemo(() =>
    points().map((p, i) => ({
      cx: p[0],
      cy: p[1],
      r: Number(otherProps.r ?? 4),
      index: i,
    })),
  )
  const animatedCircles = createPresence(
    circles,
    animOpts,
    (a, b, t) => ({
      cx: a.cx + (b.cx - a.cx) * t,
      cy: a.cy + (b.cy - a.cy) * t,
      r: a.r + (b.r - a.r) * t,
      index: b.index,
    }),
    (target) => ({ cx: target.cx, cy: target.cy, r: 0, index: target.index }),
    (current) => ({ cx: current.cx, cy: current.cy, r: 0, index: current.index }),
  )

  return (
    <Show when={chartContext.isSeriesVisible(seriesId)}>
      <g data-pc-point-group="">
        <For each={animatedCircles()}>
          {(item) => {
            const c = () => item.value
            const dataIndex = () => animatedCircles().filter((i) => i.mode !== 'exit').indexOf(item)
            const valid = () => pointDefined([c().cx, c().cy]) && (c().r > 0 || item.mode === 'exit')
            return (
              <Show when={valid()}>
                {item.mode === 'exit' || !localProps.children ? (
                  <circle
                    cx={c().cx}
                    cy={c().cy}
                    data-active={isActive(dataIndex())}
                    data-pc-point=""
                    {...circleProps(dataIndex())}
                    {...(item.mode === 'exit'
                      ? {}
                      : pointEvents(eventProps, () => ({
                          value: data()[dataIndex()] as number,
                          index: dataIndex(),
                          point: [c().cx, c().cy],
                        })))}
                    r={Math.max(0, c().r)}
                  />
                ) : (
                  localProps.children({
                    point: [c().cx, c().cy],
                    value: data()[dataIndex()] as number,
                    index: dataIndex(),
                    active: isActive(dataIndex()),
                  })
                )}
              </Show>
            )
          }}
        </For>
      </g>
    </Show>
  )
}

export default Point
