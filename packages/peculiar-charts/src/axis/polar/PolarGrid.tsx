import { usePolarAxisContext } from '@src/axis/polar/context'
import { useChartContext } from '@src/components/context'
import { usePolarLayout } from '@src/lib/polar/context'
import {
  createPolarAngleScale,
  projectAngleScale,
  projectRadiusScale,
  type PolarRadiusScale,
} from '@src/lib/polar/scale'
import { polarToCartesian } from '@src/lib/polar/utils'
import {
  For,
  Show,
  createMemo,
  mergeProps,
  splitProps,
  type ComponentProps,
} from 'solid-js'

export type PolarGridProps = ComponentProps<'g'> & {
  /** Angle axis id for polygon spokes. @defaultValue `'angle'` */
  angleAxisId?: string
  /** Grid style. @defaultValue `'polygon'` */
  gridType?: 'polygon' | 'circle'
  /** Draw radial spokes from centre to outer radius. @defaultValue `true` */
  radialLines?: boolean
}

const ringPath = (
  cx: number,
  cy: number,
  radius: number,
  angles: number[],
) => {
  if (angles.length === 0) return ''
  const [fx, fy] = polarToCartesian(cx, cy, radius, angles[0]!)
  let d = `M ${fx} ${fy}`
  for (let i = 1; i < angles.length; i++) {
    const [x, y] = polarToCartesian(cx, cy, radius, angles[i]!)
    d += ` L ${x} ${y}`
  }
  return `${d} Z`
}

/** Polar web — concentric rings or polygon grids at radius ticks.
 *
 * @data `data-pc-polar-grid-group` - Present on the grid group element.
 * @data `data-pc-polar-grid` - Present on every grid path/circle element.
 */
const PolarGrid = (props: PolarGridProps) => {
  const [localProps, otherProps] = splitProps(
    mergeProps(
      { angleAxisId: 'angle', gridType: 'polygon' as const, radialLines: true },
      props,
    ),
    ['angleAxisId', 'gridType', 'radialLines'],
  )
  const chartContext = useChartContext()
  const layout = usePolarLayout()
  const radiusAxis = usePolarAxisContext()

  const angleScale = createPolarAngleScale({
    axisId: () => localProps.angleAxisId,
    layout,
    chartContext,
  })

  const angles = createMemo(() => {
    const scale = angleScale()
    return scale.scale.domain().map((value) => projectAngleScale(scale, value))
  })

  const ringRadius = (tick: number) =>
    projectRadiusScale(radiusAxis.scale() as PolarRadiusScale, tick)

  const spokePath = (angle: number) => {
    const cx = layout.cx()
    const cy = layout.cy()
    const [x0, y0] = polarToCartesian(cx, cy, layout.innerRadius(), angle)
    const [x1, y1] = polarToCartesian(cx, cy, layout.outerRadius(), angle)
    return `M ${x0} ${y0} L ${x1} ${y1}`
  }

  return (
    <g data-pc-polar-grid-group="" {...otherProps}>
      <Show when={localProps.radialLines}>
        <For each={angles()}>
          {(angle) => (
            <path d={spokePath(angle)} fill="none" data-pc-polar-grid="" />
          )}
        </For>
      </Show>
      <For each={radiusAxis.labelTicks()}>
        {(tick) => {
          const r = () => ringRadius(tick)
          return localProps.gridType === 'circle' ? (
            <circle
              cx={layout.cx()}
              cy={layout.cy()}
              r={r()}
              fill="none"
              data-pc-polar-grid=""
            />
          ) : (
            <path
              d={ringPath(layout.cx(), layout.cy(), r(), angles())}
              fill="none"
              data-pc-polar-grid=""
            />
          )
        }}
      </For>
    </g>
  )
}

export default PolarGrid
