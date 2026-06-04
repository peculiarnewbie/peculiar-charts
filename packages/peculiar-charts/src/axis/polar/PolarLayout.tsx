import { useChartContext } from '@src/components/context'
import { PolarLayoutContext } from '@src/lib/polar/context'
import { resolveRadius } from '@src/lib/polar/utils'
import { type JSX, createMemo, mergeProps } from 'solid-js'

export type PolarLayoutProps = {
  /** Centre x in svg coords. @defaultValue plot centre */
  cx?: number
  /** Centre y in svg coords. @defaultValue plot centre */
  cy?: number
  /** Inner radius — px or `%` of available radius. @defaultValue `0` */
  innerRadius?: number | `${number}%`
  /** Outer radius — px or `%` of available radius. @defaultValue `'80%'` */
  outerRadius?: number | `${number}%`
  /** Start angle in radians. @defaultValue `-π/2` (top) */
  startAngle?: number
  /** End angle in radians. @defaultValue `3π/2` (full turn from top) */
  endAngle?: number
  children?: JSX.Element
}

/** Polar coordinate frame — provides centre, radii, and angular range to axes and series. */
const PolarLayout = (props: PolarLayoutProps) => {
  const defaultedProps = mergeProps(
    {
      innerRadius: 0 as const,
      outerRadius: '80%' as const,
      startAngle: -Math.PI / 2,
      endAngle: (3 * Math.PI) / 2,
    },
    props,
  )
  const chartContext = useChartContext()

  const geometry = createMemo(() => {
    const left = chartContext.getInset('left')
    const right = chartContext.width() - chartContext.getInset('right')
    const top = chartContext.getInset('top')
    const bottom = chartContext.height() - chartContext.getInset('bottom')
    const cx = defaultedProps.cx ?? (left + right) / 2
    const cy = defaultedProps.cy ?? (top + bottom) / 2
    const available = Math.max(0, Math.min(right - left, bottom - top) / 2)
    return {
      cx,
      cy,
      innerRadius: resolveRadius(defaultedProps.innerRadius, available),
      outerRadius: resolveRadius(defaultedProps.outerRadius, available),
      startAngle: defaultedProps.startAngle,
      endAngle: defaultedProps.endAngle,
    }
  })

  return (
    <PolarLayoutContext.Provider
      value={{
        cx: () => geometry().cx,
        cy: () => geometry().cy,
        innerRadius: () => geometry().innerRadius,
        outerRadius: () => geometry().outerRadius,
        startAngle: () => geometry().startAngle,
        endAngle: () => geometry().endAngle,
      }}
    >
      {defaultedProps.children}
    </PolarLayoutContext.Provider>
  )
}

export default PolarLayout
