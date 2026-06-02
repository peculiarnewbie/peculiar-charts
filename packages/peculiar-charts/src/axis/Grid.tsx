import { useAxisContext } from '@src/axis/context'
import { useChartContext } from '@src/components/context'
import { projectScale } from '@src/lib/scale'
import { type ComponentProps, For, mergeProps } from 'solid-js'

export type GridProps = Omit<ComponentProps<'line'>, 'x1' | 'y1' | 'x2' | 'y2'>

/** Grid lines across the plot at each axis tick.
 *
 * @data `data-pc-axis-grid-group` - Present on every grid group element.
 * @data `data-pc-axis-grid` - Present on every grid line element.
 */
const Grid = (props: GridProps) => {
  const chartContext = useChartContext()
  const axisContext = useAxisContext()
  const defaultedProps = mergeProps(
    { stroke: 'currentColor', 'stroke-width': 1 },
    props,
  )

  const pos = (tick: any) => projectScale(axisContext.scale(), tick)

  const x = (tick: any) =>
    axisContext.axis() === 'x' ? pos(tick) : chartContext.getInset('left')
  const y = (tick: any) =>
    axisContext.axis() === 'x' ? chartContext.getInset('top') : pos(tick)
  const x2 = (tick: any) =>
    axisContext.axis() === 'x'
      ? pos(tick)
      : chartContext.width() - chartContext.getInset('right')
  const y2 = (tick: any) =>
    axisContext.axis() === 'x'
      ? chartContext.height() - chartContext.getInset('bottom')
      : pos(tick)

  return (
    <g data-pc-axis-grid-group="">
      <For each={axisContext.labelTicks()}>
        {(tick) => (
          <line
            x1={x(tick)}
            y1={y(tick)}
            x2={x2(tick)}
            y2={y2(tick)}
            data-pc-axis-grid=""
            {...defaultedProps}
          />
        )}
      </For>
    </g>
  )
}

export default Grid
