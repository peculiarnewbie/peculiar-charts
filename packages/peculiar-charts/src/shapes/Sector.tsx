import type { OverrideProps } from '@src/lib/types'
import { arc as d3arc } from 'd3-shape'
import { type ComponentProps, createMemo, mergeProps, splitProps } from 'solid-js'

export type SectorProps = OverrideProps<
  Omit<ComponentProps<'path'>, 'd'>,
  {
    /** Centre x. */
    cx: number
    /** Centre y. */
    cy: number
    /** Inner radius in px. @defaultValue `0` */
    innerRadius?: number
    /** Outer radius in px. */
    outerRadius: number
    /** Start angle in radians. */
    startAngle: number
    /** End angle in radians. */
    endAngle: number
    /** Rounded corner radius in px. @defaultValue `0` */
    cornerRadius?: number
  }
>

/** SVG arc sector — pie/donut slice building block for custom polar series. */
const Sector = (props: SectorProps) => {
  const defaultedProps = mergeProps({ innerRadius: 0, cornerRadius: 0 }, props)
  const [localProps, otherProps] = splitProps(defaultedProps, [
    'cx',
    'cy',
    'innerRadius',
    'outerRadius',
    'startAngle',
    'endAngle',
    'cornerRadius',
  ])

  const d = createMemo(() =>
    d3arc<{ startAngle: number; endAngle: number }>()
      .innerRadius(localProps.innerRadius)
      .outerRadius(localProps.outerRadius)
      .cornerRadius(localProps.cornerRadius)({
        startAngle: localProps.startAngle,
        endAngle: localProps.endAngle,
      }),
  )

  return (
    <g transform={`translate(${localProps.cx}, ${localProps.cy})`}>
      <path d={d() ?? undefined} {...otherProps} />
    </g>
  )
}

export default Sector
