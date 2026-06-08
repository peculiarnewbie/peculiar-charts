import { describe, expect, it } from 'vitest'
import { polarToCartesian, resolveRadius } from '../polar/utils'

describe('resolveRadius', () => {
  it('returns numeric value as-is', () => {
    expect(resolveRadius(50, 200)).toBe(50)
    expect(resolveRadius(0, 200)).toBe(0)
  })

  it('resolves percentage of available radius', () => {
    expect(resolveRadius('50%', 200)).toBe(100)
    expect(resolveRadius('100%', 200)).toBe(200)
    expect(resolveRadius('25%', 200)).toBe(50)
  })

  it('handles 0%', () => {
    expect(resolveRadius('0%', 200)).toBe(0)
  })
})

describe('polarToCartesian', () => {
  it('converts 0 angle to rightward point', () => {
    const [x, y] = polarToCartesian(0, 0, 100, 0)
    expect(x).toBeCloseTo(100)
    expect(y).toBeCloseTo(0)
  })

  it('converts PI/2 to downward point (SVG y-down)', () => {
    const [x, y] = polarToCartesian(0, 0, 100, Math.PI / 2)
    expect(x).toBeCloseTo(0)
    expect(y).toBeCloseTo(100)
  })

  it('converts PI to leftward point', () => {
    const [x, y] = polarToCartesian(0, 0, 100, Math.PI)
    expect(x).toBeCloseTo(-100)
    expect(y).toBeCloseTo(0)
  })

  it('respects center offset', () => {
    const [x, y] = polarToCartesian(50, 50, 100, 0)
    expect(x).toBeCloseTo(150)
    expect(y).toBeCloseTo(50)
  })

  it('handles zero radius', () => {
    const [x, y] = polarToCartesian(10, 20, 0, Math.PI / 4)
    expect(x).toBeCloseTo(10)
    expect(y).toBeCloseTo(20)
  })
})
