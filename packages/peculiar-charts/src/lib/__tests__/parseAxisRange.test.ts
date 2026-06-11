import { describe, expect, it } from 'vitest'
import { parseAxisRange, resolveRangeValue } from '../parseAxisRange'

describe('parseAxisRange', () => {
  it('parses bare "dataMin"', () => {
    const fn = parseAxisRange('dataMin')
    expect(fn).not.toBeNull()
    expect(fn!(10, 100)).toBe(10)
  })

  it('parses bare "dataMax"', () => {
    const fn = parseAxisRange('dataMax')
    expect(fn).not.toBeNull()
    expect(fn!(10, 100)).toBe(100)
  })

  it('parses "dataMax + N"', () => {
    const fn = parseAxisRange('dataMax + 1000')
    expect(fn).not.toBeNull()
    expect(fn!(10, 100)).toBe(1100)
  })

  it('parses "dataMin - N"', () => {
    const fn = parseAxisRange('dataMin - 50')
    expect(fn).not.toBeNull()
    expect(fn!(10, 100)).toBe(-40)
  })

  it('parses decimal offsets', () => {
    const fn = parseAxisRange('dataMax + 0.5')
    expect(fn).not.toBeNull()
    expect(fn!(0, 10)).toBe(10.5)
  })

  it('handles whitespace variations', () => {
    expect(parseAxisRange('dataMax+100')!(0, 50)).toBe(150)
    expect(parseAxisRange('dataMin -200')!(50, 100)).toBe(-150)
    expect(parseAxisRange('dataMax  +  300')!(0, 50)).toBe(350)
  })

  it('returns null for unrecognised strings', () => {
    expect(parseAxisRange('auto')).toBeNull()
    expect(parseAxisRange('invalid')).toBeNull()
    expect(parseAxisRange('')).toBeNull()
    expect(parseAxisRange('dataMax * 2')).toBeNull()
    expect(parseAxisRange('100')).toBeNull()
  })
})

describe('resolveRangeValue', () => {
  it('returns numeric values as-is', () => {
    expect(resolveRangeValue(42, 10, 100)).toBe(42)
    expect(resolveRangeValue(0, 10, 100)).toBe(0)
  })

  it('returns undefined for "min" and "max"', () => {
    expect(resolveRangeValue('min', 10, 100)).toBeUndefined()
    expect(resolveRangeValue('max', 10, 100)).toBeUndefined()
  })

  it('evaluates domain expressions', () => {
    expect(resolveRangeValue('dataMax + 1000', 10, 100)).toBe(1100)
    expect(resolveRangeValue('dataMin - 50', 10, 100)).toBe(-40)
    expect(resolveRangeValue('dataMin', 10, 100)).toBe(10)
    expect(resolveRangeValue('dataMax', 10, 100)).toBe(100)
  })

  it('returns undefined for unrecognised strings', () => {
    expect(resolveRangeValue('auto', 10, 100)).toBeUndefined()
  })
})
