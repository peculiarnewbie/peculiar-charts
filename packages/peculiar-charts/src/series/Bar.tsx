import { useChartContext } from '@src/components/context'
import {
  type AnimationOptions,
  type ResolvedAnimationOptions,
  createPresence,
  resolveAnimation,
} from '@src/lib/animation'
import type { BarLayout } from '@src/lib/createBands'
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
    /** Bar orientation. @defaultValue `'vertical'` */
    layout?: BarLayout
    /** Animation configuration. */
    animation?: AnimationOptions
  } & PointEvents
>

type BarRect = { x: number; y: number; width: number; height: number }

/** Bar series.
 *
 * @data `data-pc-bar-group` - Present on every bar group element.
 * @data `data-pc-bar` - Present on every bar rect element.
 */
const Bar = (props: BarProps) => {
  const seriesId = createUniqueId()
  const defaultedProps = mergeProps(
    {
      xAxisId: 'x',
      yAxisId: 'y',
      layout: 'vertical' as const,
      fill: 'currentColor',
      stroke: 'none',
    },
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
      'layout',
      'animation',
    ],
    ['onPointClick', 'onPointEnter', 'onPointLeave'],
  )
  const chartContext = useChartContext()
  const horizontal = () => localProps.layout === 'horizontal'

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
    xAxisId: () => localProps.xAxisId,
    yAxisId: () => localProps.yAxisId,
    valueAxisId: () =>
      horizontal() ? localProps.xAxisId : localProps.yAxisId,
    dataKey: () => localProps.dataKey,
    stackId: () => localProps.stackId,
    data,
    chartContext,
  })

  const points = createPoints({
    layout: () => localProps.layout,
    xAxisId: () => localProps.xAxisId,
    yAxisId: () => localProps.yAxisId,
    dataKey: () => localProps.dataKey,
    stackId: () => localProps.stackId,
    data,
    chartContext,
  })

  const baseLine = createBaseLine({
    layout: () => localProps.layout,
    xAxisId: () => localProps.xAxisId,
    yAxisId: () => localProps.yAxisId,
    dataKey: () => localProps.dataKey,
    stackId: () => localProps.stackId,
    data,
    chartContext,
  })

  const bands = createBands({
    seriesId,
    stackId: () => localProps.stackId,
    layout: () => localProps.layout,
    data,
    chartContext,
  })

  const bars = (): BarRect[] => {
    const _points = points()
    let _baseLine = baseLine()
    if (!Array.isArray(_baseLine))
      _baseLine = new Array(_points.length).fill(_baseLine)
    const _bands = bands()

    return _points.map((point, i) => {
      const band = _bands[i]!
      const base = _baseLine[i]!
      if (horizontal()) {
        const xValue = point[0]
        return {
          x: xValue > base ? base : xValue,
          y: band.y,
          width: xValue > base ? xValue - base : base - xValue,
          height: band.height,
        }
      }
      const yValue = point[1]
      return {
        x: band.x,
        y: yValue > base ? base : yValue,
        width: band.width,
        height: yValue > base ? yValue - base : base - yValue,
      }
    })
  }

  const animOpts = createMemo<ResolvedAnimationOptions>(() =>
    resolveAnimation(localProps.animation),
  )
  const enterBar = (bar: BarRect): BarRect => {
    const _baseLine = baseLine()
    const bl = Array.isArray(_baseLine) ? _baseLine[0] : _baseLine
    if (horizontal()) {
      return { x: bl ?? 0, y: bar.y, width: 0, height: bar.height }
    }
    return { x: bar.x, y: bl ?? 0, width: bar.width, height: 0 }
  }
  const exitBar = (bar: BarRect): BarRect => {
    if (horizontal()) {
      return { x: bar.x, y: bar.y, width: 0, height: bar.height }
    }
    return { x: bar.x, y: bar.y + bar.height, width: bar.width, height: 0 }
  }
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

  const liveBars = () => animatedBars().filter((i) => i.mode !== 'exit')

  return (
    <Show when={chartContext.isSeriesVisible(seriesId)}>
      <g data-pc-bar-group="">
        <For each={animatedBars()}>
          {(item) => {
            const bar = () => item.value
            const idx = () => liveBars().indexOf(item)
            const eventPoint = (): [number, number] =>
              horizontal()
                ? [bar().x + bar().width / 2, bar().y + bar().height / 2]
                : [bar().x + bar().width / 2, bar().y]
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
                      value: data()[idx()] as number,
                      index: idx(),
                      point: eventPoint(),
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
