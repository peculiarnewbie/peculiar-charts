import type { ChartContextType } from '@src/components/context'
import type { PolarLayout } from '@src/lib/polar/context'
import { type Accessor, createMemo } from 'solid-js'
import { scaleLinear, scalePoint } from 'd3-scale'

export type PolarAngleScale = {
  type: 'angle'
  scale: ReturnType<typeof scalePoint<string>>
}

export type PolarRadiusScale = {
  type: 'radius'
  scale: ReturnType<typeof scaleLinear<number, number>>
}

export type PolarAxisScale = PolarAngleScale | PolarRadiusScale

export const createPolarAngleScale = (props: {
  axisId: Accessor<string>
  layout: PolarLayout
  chartContext: ChartContextType
}): Accessor<PolarAngleScale> =>
  createMemo(() => {
    const domain = props.chartContext.getDomain(
      props.axisId(),
      'angle',
    )
    const values =
      domain.kind === 'categorical'
        ? domain.values.map(String)
        : []
    const start = props.layout.startAngle()
    const end = props.layout.endAngle()
    const range = end - start
    // When the angular range is a full circle, the last point would overlap
    // the first if placed at endAngle. Shrink the range so the step becomes
    // 2π / n instead of 2π / (n − 1), giving evenly-spaced spokes with no overlap.
    const fullCircle = Math.abs(range - 2 * Math.PI) < 0.001
    const adjustedEnd = fullCircle && values.length > 1
      ? start + range * (values.length - 1) / values.length
      : end
    return {
      type: 'angle' as const,
      scale: scalePoint<string>(values, [start, adjustedEnd]),
    }
  })

export const createPolarRadiusScale = (props: {
  axisId: Accessor<string>
  layout: PolarLayout
  chartContext: ChartContextType
}): Accessor<PolarRadiusScale> =>
  createMemo(() => {
    const domain = props.chartContext.getDomain(
      props.axisId(),
      'radius',
    )
    let min = domain.kind === 'numeric' ? domain.min : 0
    const max = domain.kind === 'numeric' ? domain.max : 0
    if (domain.kind === 'numeric' && !domain.userDefined) min = Math.min(min, 0)

    const scale = scaleLinear([min, max], [
      props.layout.innerRadius(),
      props.layout.outerRadius(),
    ])
    if (domain.kind === 'numeric' && !domain.userDefined) scale.nice()

    return { type: 'radius' as const, scale }
  })

export const projectAngleScale = (scale: PolarAngleScale, value: any): number => {
  const angle = scale.scale(String(value))
  return angle === undefined ? Number.NaN : angle
}

export const projectRadiusScale = (
  scale: PolarRadiusScale,
  value: number,
): number => {
  if (!Number.isFinite(value)) return Number.NaN
  return scale.scale(value)
}

export const polarScaleTicks = (
  scale: PolarAxisScale,
  count: number,
): any[] => {
  switch (scale.type) {
    case 'angle':
      return scale.scale.domain()
    case 'radius':
      return scale.scale.ticks(count)
  }
}
