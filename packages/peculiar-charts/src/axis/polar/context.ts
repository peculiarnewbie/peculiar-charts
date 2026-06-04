import type { PolarAxisScale } from '@src/lib/polar/scale'
import { type Accessor, createContext, useContext } from 'solid-js'

export type PolarAxisContextType = {
  axisId: Accessor<string>
  axis: Accessor<'angle' | 'radius'>
  scale: Accessor<PolarAxisScale>
  ticks: Accessor<any[]>
  labelTicks: Accessor<any[]>
  setLabelTicks: (ticks: any[]) => void
  /** Spoke angle in radians — only set on radius axes. */
  angle?: Accessor<number>
}

export const PolarAxisContext = createContext<PolarAxisContextType>()

export const usePolarAxisContext = () => {
  const ctx = useContext(PolarAxisContext)
  if (!ctx) {
    throw new Error(
      '[peculiar-charts]: Polar axis context not found. Wrap components in <PolarAngleAxis> or <PolarRadiusAxis>',
    )
  }
  return ctx
}
