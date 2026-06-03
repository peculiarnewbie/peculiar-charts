import { useChartContext } from '@src/components/context'
import {
  type AnimationOptions,
  type ResolvedAnimationOptions,
  createPresence,
  resolveAnimation,
} from '@src/lib/animation'
import createBands from '@src/lib/createBands'
import createBaseLine from '@src/lib/createBaseLine'
import createPoints from '@src/lib/createPoints'
import createSeries from '@src/lib/createSeries'
import { type PointEvents, pointEvents } from '@src/lib/markers'
import type { OverrideProps } from '@src/lib/types'
import { accessData } from '@src/lib/utils'
import {
  type ComponentProps,
  For,
  Show,
  createEffect,
  createMemo,
  createUniqueId,
  mergeProps,
  onCleanup,
  splitProps,
} from 'solid-js'

export type BarProps = OverrideProps<
  Omit<ComponentProps<'rect'>, 'x' | 'width' | 'y' | 'height'>,
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
    /** Animation configuration. */
    animation?: AnimationOptions
  } & PointEvents
>

/** Bar series.
 *
 * @data `data-pc-bar-group` - Present on every bar group element.
 * @data `data-pc-bar` - Present on every bar rect element.
 */
const Bar = (props: BarProps) => {
  const seriesId = createUniqueId()
  const defaultedProps = mergeProps(
    { xAxisId: 'x', yAxisId: 'y', fill: 'currentColor', stroke: 'none' },
    props,
  )
  const [localProps, eventProps, otherProps] = splitProps(
    defaultedProps,
    ['dataKey', 'name', 'xAxisId', 'yAxisId', 'stackId', 'animation'],
    ['onPointClick', 'onPointEnter', 'onPointLeave'],
  )
  const chartContext = useChartContext()

  // Reserve a slot in the grouped-bar layout while visible.
  createEffect(() => {
    if (!chartContext.isSeriesVisible(seriesId)) return
    const key = localProps.stackId ?? seriesId
    chartContext.registerBar(key)
    onCleanup(() => chartContext.unregisterBar(key))
  })

  const data = createMemo(() =>
    accessData<number>(chartContext.data(), localProps.dataKey),
  )

  createSeries({
    seriesId,
    name: () => localProps.name ?? localProps.dataKey ?? 'series',
    type: 'bar',
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

  const baseLine = createBaseLine({
    yAxisId: () => localProps.yAxisId,
    dataKey: () => localProps.dataKey,
    stackId: () => localProps.stackId,
    data,
    chartContext,
  })

  const bands = createBands({
    seriesId,
    stackId: () => localProps.stackId,
    data,
    chartContext,
  })

  const bars = () => {
    const _points = points()
    let _baseLine = baseLine()
    if (!Array.isArray(_baseLine))
      _baseLine = new Array(_points.length).fill(_baseLine)
    const _bands = bands()
    return _points.map((point, i) => {
      const yValue = point[1]
      const base = _baseLine[i]!
      return {
        x: _bands[i]!.x,
        width: _bands[i]!.width,
        y: yValue > base ? base : yValue,
        height: yValue > base ? yValue - base : base - yValue,
      }
    })
  }

  const animOpts = createMemo<ResolvedAnimationOptions>(() =>
    resolveAnimation(localProps.animation),
  )
  const enterBar = (bar: { x: number; width: number; y: number; height: number }) => {
    const _baseLine = baseLine()
    const bl = Array.isArray(_baseLine) ? _baseLine[0] : _baseLine
    return {
      x: bar.x,
      width: bar.width,
      y: bl ?? 0,
      height: 0,
    }
  }
  const exitBar = (bar: { x: number; width: number; y: number; height: number }) => ({
    x: bar.x,
    width: bar.width,
    y: bar.y + bar.height,
    height: 0,
  })
  const animatedBars = createPresence(
    bars,
    animOpts,
    (a, b, t) => ({
      x: a.x + (b.x - a.x) * t,
      width: a.width + (b.width - a.width) * t,
      y: a.y + (b.y - a.y) * t,
      height: a.height + (b.height - a.height) * t,
    }),
    enterBar,
    exitBar,
  )

  return (
    <Show when={chartContext.isSeriesVisible(seriesId)}>
      <g data-pc-bar-group="">
        <For each={animatedBars()}>
          {(item) => {
            const bar = () => item.value
            return (
              <rect
                x={bar().x}
                y={bar().y}
                width={bar().width}
                height={bar().height}
                {...otherProps}
                {...(item.mode === 'exit'
                  ? {}
                  : pointEvents(eventProps, () => ({
                      value: data()[animatedBars().filter((i) => i.mode !== 'exit').indexOf(item)] as number,
                      index: animatedBars().filter((i) => i.mode !== 'exit').indexOf(item),
                      point: [bar().x + bar().width / 2, bar().y],
                    })))}
                data-pc-bar=""
              />
            )
          }}
        </For>
      </g>
    </Show>
  )
}

export default Bar
