import { useChartContext } from '@src/components/context'
import createPoints from '@src/lib/createPoints'
import type { OverrideProps } from '@src/lib/types'
import { accessData, pointDefined } from '@src/lib/utils'
import {
  type ComponentProps,
  For,
  type JSX,
  Show,
  createMemo,
  mergeProps,
  splitProps,
} from 'solid-js'

/** A label's anchor point plus the datum it came from. */
export type SeriesLabelDatum = {
  point: [number, number]
  value: number
  index: number
}

export type SeriesLabelProps = OverrideProps<
  Omit<ComponentProps<'text'>, 'x' | 'y'>,
  {
    /** Data key for the y-values. Omit for plain number arrays. */
    dataKey?: string
    /** Bound x-axis id. @defaultValue `'x'` */
    xAxisId?: string
    /** Bound value-axis id. @defaultValue `'y'` */
    yAxisId?: string
    /** Stack id — must match the labelled series' stack. */
    stackId?: string
    /** Pixel offset above each point (away from the plot). @defaultValue `8` */
    offset?: number
    /** Format a value to its label string. @defaultValue `String` */
    format?: (value: number, index: number) => string
    /** Render each label yourself instead of the default `<text>`. */
    children?: (datum: SeriesLabelDatum) => JSX.Element
  }
>

/** Renders a value label at each data point of a series.
 *
 * @data `data-pc-series-label-group` - Present on the label group element.
 * @data `data-pc-series-label` - Present on every label text element.
 */
const SeriesLabel = (props: SeriesLabelProps) => {
  const defaultedProps = mergeProps(
    {
      xAxisId: 'x',
      yAxisId: 'y',
      offset: 8,
      format: (value: number) => String(value),
      fill: 'currentColor',
      'text-anchor': 'middle' as const,
    },
    props,
  )
  const [localProps, otherProps] = splitProps(defaultedProps, [
    'dataKey',
    'xAxisId',
    'yAxisId',
    'stackId',
    'offset',
    'format',
    'children',
  ])
  const chartContext = useChartContext()

  const data = createMemo(() =>
    accessData<number>(chartContext.data(), localProps.dataKey),
  )

  const points = createPoints({
    xAxisId: () => localProps.xAxisId,
    yAxisId: () => localProps.yAxisId,
    dataKey: () => localProps.dataKey,
    stackId: () => localProps.stackId,
    data,
    chartContext,
  })

  return (
    <g data-pc-series-label-group="">
      <For each={points()}>
        {(point, index) => (
          <Show when={pointDefined(point)}>
            <Show
              when={localProps.children}
              fallback={
                <text
                  x={point[0]}
                  y={point[1] - localProps.offset}
                  data-pc-series-label=""
                  {...otherProps}
                >
                  {localProps.format(data()[index()] as number, index())}
                </text>
              }
            >
              {(children) =>
                children()({
                  point,
                  value: data()[index()] as number,
                  index: index(),
                })
              }
            </Show>
          </Show>
        )}
      </For>
    </g>
  )
}

export default SeriesLabel
