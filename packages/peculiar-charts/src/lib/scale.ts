import {
  type ScaleBand,
  type ScaleLinear,
  type ScaleLogarithmic,
  type ScalePoint,
  type ScaleTime,
  scaleBand,
  scaleLinear,
  scaleLog,
  scalePoint,
  scaleTime,
} from 'd3-scale'

/**
 * The kinds of scale peculiar-charts can place a value on.
 *
 * - `linear` / `log` — continuous numeric domains.
 * - `time` — continuous temporal domains (Date / timestamp).
 * - `band` — discrete domain with a bandwidth (used to size bars).
 * - `point` — discrete domain collapsed to zero-width points (used to place
 *   line / area / scatter markers on a categorical axis).
 */
export type ScaleType = 'linear' | 'log' | 'time' | 'band' | 'point'

export type Scale =
  | { type: 'linear'; scale: ScaleLinear<number, number> }
  | { type: 'log'; scale: ScaleLogarithmic<number, number> }
  | { type: 'time'; scale: ScaleTime<number, number> }
  | { type: 'band'; scale: ScaleBand<string> }
  | { type: 'point'; scale: ScalePoint<string> }

export const isCategorical = (type: ScaleType) =>
  type === 'band' || type === 'point'

export const isNumeric = (type: ScaleType) => !isCategorical(type)

/**
 * Builds a {@link Scale} of the given `type` from a domain and a pixel range.
 *
 * `domain` is a `[min, max]` pair for numeric/time scales, or the ordered list
 * of categories for band/point scales.
 */
export const buildScale = (
  type: ScaleType,
  domain: any[],
  range: [number, number],
  options?: { padding?: number; reverse?: boolean },
): Scale => {
  const [r0, r1] = options?.reverse ? [range[1], range[0]] : range
  switch (type) {
    case 'linear':
      return { type, scale: scaleLinear(domain as number[], [r0, r1]) }
    case 'log':
      return { type, scale: scaleLog(domain as number[], [r0, r1]) }
    case 'time':
      return { type, scale: scaleTime(domain as number[], [r0, r1]) }
    case 'band':
      return {
        type,
        scale: scaleBand<string>(domain.map(String), [r0, r1]).paddingInner(
          options?.padding ?? 0,
        ),
      }
    case 'point':
      return {
        type,
        scale: scalePoint<string>(domain.map(String), [r0, r1]).padding(
          options?.padding ?? 0,
        ),
      }
  }
}

/**
 * Projects a single domain value to its pixel position on the scale.
 * Band values resolve to the centre of their band so that markers and lines
 * sit in the middle of categorical slots.
 */
export const projectScale = (scale: Scale, value: any): number => {
  switch (scale.type) {
    case 'band': {
      const x = scale.scale(String(value))
      return x === undefined ? Number.NaN : x + scale.scale.bandwidth() / 2
    }
    case 'point': {
      const x = scale.scale(String(value))
      return x === undefined ? Number.NaN : x
    }
    default:
      return scale.scale(value as never)
  }
}

/** Produces the tick values for a scale, optionally targeting a count. */
export const scaleTicks = (scale: Scale, count: number): any[] => {
  switch (scale.type) {
    case 'linear':
    case 'log':
    case 'time':
      return scale.scale.ticks(count)
    case 'band':
    case 'point':
      return scale.scale.domain()
  }
}
