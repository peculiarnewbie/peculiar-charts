import { describe, expect, it } from 'vitest'
import {
  buildScale,
  invertScale,
  isCategorical,
  isNumeric,
  projectScale,
  scaleTicks,
} from '../scale'

describe('isCategorical', () => {
  it('returns true for band and point', () => {
    expect(isCategorical('band')).toBe(true)
    expect(isCategorical('point')).toBe(true)
  })

  it('returns false for continuous types', () => {
    expect(isCategorical('linear')).toBe(false)
    expect(isCategorical('log')).toBe(false)
    expect(isCategorical('time')).toBe(false)
  })
})

describe('isNumeric', () => {
  it('returns the inverse of isCategorical', () => {
    expect(isNumeric('linear')).toBe(true)
    expect(isNumeric('log')).toBe(true)
    expect(isNumeric('time')).toBe(true)
    expect(isNumeric('band')).toBe(false)
    expect(isNumeric('point')).toBe(false)
  })
})

describe('buildScale', () => {
  it('builds a linear scale', () => {
    const s = buildScale('linear', [0, 100], [0, 500])
    expect(s.type).toBe('linear')
    expect(s.scale(0)).toBe(0)
    expect(s.scale(50)).toBe(250)
    expect(s.scale(100)).toBe(500)
  })

  it('builds a reversed linear scale', () => {
    const s = buildScale('linear', [0, 100], [0, 500], { reverse: true })
    expect(s.scale(0)).toBe(500)
    expect(s.scale(100)).toBe(0)
  })

  it('builds a band scale', () => {
    const s = buildScale('band', ['a', 'b', 'c'], [0, 300])
    expect(s.type).toBe('band')
    expect(s.scale.domain()).toEqual(['a', 'b', 'c'])
    expect(s.scale.bandwidth()).toBeGreaterThan(0)
  })

  it('builds a band scale with padding', () => {
    const s = buildScale('band', ['a', 'b'], [0, 200], { padding: 0.5 })
    expect(s.scale.paddingInner()).toBe(0.5)
  })

  it('builds a point scale', () => {
    const s = buildScale('point', ['x', 'y', 'z'], [0, 300])
    expect(s.type).toBe('point')
    expect(s.scale.domain()).toEqual(['x', 'y', 'z'])
  })

  it('builds a time scale', () => {
    const d0 = new Date(2020, 0, 1).getTime()
    const d1 = new Date(2020, 11, 31).getTime()
    const s = buildScale('time', [d0, d1], [0, 1000])
    expect(s.type).toBe('time')
  })

  it('builds a log scale', () => {
    const s = buildScale('log', [1, 1000], [0, 300])
    expect(s.type).toBe('log')
    expect(s.scale(1)).toBe(0)
    expect(s.scale(1000)).toBe(300)
  })
})

describe('projectScale', () => {
  it('projects linear values', () => {
    const s = buildScale('linear', [0, 100], [0, 500])
    expect(projectScale(s, 0)).toBe(0)
    expect(projectScale(s, 100)).toBe(500)
    expect(projectScale(s, 50)).toBe(250)
  })

  it('projects band values to center of band', () => {
    const s = buildScale('band', ['a', 'b', 'c'], [0, 300])
    const projected = projectScale(s, 'a')
    const bw = s.scale.bandwidth()
    // Should be band start + half bandwidth
    expect(projected).toBe(s.scale('a')! + bw / 2)
  })

  it('projects point values directly', () => {
    const s = buildScale('point', ['a', 'b'], [0, 200])
    expect(projectScale(s, 'a')).toBe(s.scale('a'))
  })

  it('returns NaN for unknown band value', () => {
    const s = buildScale('band', ['a', 'b'], [0, 200])
    expect(projectScale(s, 'unknown')).toBeNaN()
  })
})

describe('invertScale', () => {
  it('inverts a linear scale', () => {
    const s = buildScale('linear', [0, 100], [0, 500])
    expect(invertScale(s, 0)).toBe(0)
    expect(invertScale(s, 500)).toBe(100)
    expect(invertScale(s, 250)).toBe(50)
  })

  it('returns undefined for non-finite pixel', () => {
    const s = buildScale('linear', [0, 100], [0, 500])
    expect(invertScale(s, Infinity)).toBeUndefined()
    expect(invertScale(s, NaN)).toBeUndefined()
  })

  it('inverts a band scale by nearest match', () => {
    const s = buildScale('band', ['a', 'b', 'c'], [0, 300])
    // project 'b' and invert should return 'b'
    const px = projectScale(s, 'b')
    expect(invertScale(s, px)).toBe('b')
  })

  it('inverts a point scale by nearest match', () => {
    const s = buildScale('point', ['x', 'y', 'z'], [0, 300])
    const px = projectScale(s, 'y')
    expect(invertScale(s, px)).toBe('y')
  })
})

describe('scaleTicks', () => {
  it('returns ticks for linear scale', () => {
    const s = buildScale('linear', [0, 100], [0, 500])
    const ticks = scaleTicks(s, 5)
    expect(ticks.length).toBeGreaterThan(0)
    expect(ticks.every((t: unknown) => typeof t === 'number')).toBe(true)
  })

  it('returns domain for band scale', () => {
    const s = buildScale('band', ['a', 'b', 'c'], [0, 300])
    expect(scaleTicks(s, 5)).toEqual(['a', 'b', 'c'])
  })

  it('returns domain for point scale', () => {
    const s = buildScale('point', ['x', 'y'], [0, 200])
    expect(scaleTicks(s, 5)).toEqual(['x', 'y'])
  })
})
