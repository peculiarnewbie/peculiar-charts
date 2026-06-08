import { describe, expect, it } from 'vitest'
import {
  accessData,
  gapToPadding,
  pointDefined,
  toNumeric,
  uniqueInOrder,
} from '../utils'

describe('accessData', () => {
  it('returns data as-is when no dataKey is given', () => {
    const data = [1, 2, 3]
    expect(accessData(data, undefined)).toEqual([1, 2, 3])
  })

  it('extracts values by flat key', () => {
    const data = [
      { name: 'a', value: 10 },
      { name: 'b', value: 20 },
    ]
    expect(accessData(data, 'value')).toEqual([10, 20])
  })

  it('extracts values by dot-path key', () => {
    const data = [
      { stats: { count: 1 } },
      { stats: { count: 2 } },
    ]
    expect(accessData(data, 'stats.count')).toEqual([1, 2])
  })

  it('returns undefined for missing nested path', () => {
    const data = [{ a: 1 }]
    expect(accessData(data, 'b.c')).toEqual([undefined])
  })

  it('throws when dataKey is set but data is not an array', () => {
    expect(() => accessData('not-an-array' as any, 'key')).toThrow(
      /Expected data to be an array/,
    )
  })

  it('throws when no dataKey and data is not an array', () => {
    expect(() => accessData(null as any, undefined)).toThrow(
      /Expected data to be an array/,
    )
  })
})

describe('toNumeric', () => {
  it('converts numbers', () => {
    expect(toNumeric(42)).toBe(42)
    expect(toNumeric(0)).toBe(0)
    expect(toNumeric(-3.5)).toBe(-3.5)
  })

  it('converts numeric strings', () => {
    expect(toNumeric('100')).toBe(100)
    expect(toNumeric('3.14')).toBe(3.14)
  })

  it('converts Date to epoch ms', () => {
    const d = new Date(2020, 0, 1)
    expect(toNumeric(d)).toBe(d.getTime())
  })

  it('returns null for non-finite values', () => {
    expect(toNumeric(NaN)).toBeNull()
    expect(toNumeric(Infinity)).toBeNull()
    expect(toNumeric(-Infinity)).toBeNull()
    expect(toNumeric('hello')).toBeNull()
  })
})

describe('uniqueInOrder', () => {
  it('deduplicates values preserving order', () => {
    expect(uniqueInOrder([1, 2, 2, 3, 1, 4])).toEqual([1, 2, 3, 4])
  })

  it('works with strings', () => {
    expect(uniqueInOrder(['a', 'b', 'a', 'c'])).toEqual(['a', 'b', 'c'])
  })

  it('returns empty array for empty input', () => {
    expect(uniqueInOrder([])).toEqual([])
  })

  it('returns same array when all unique', () => {
    expect(uniqueInOrder([1, 2, 3])).toEqual([1, 2, 3])
  })
})

describe('gapToPadding', () => {
  it('converts numeric gap to ratio', () => {
    expect(gapToPadding(10, 100)).toBe(0.1)
    expect(gapToPadding(0, 100)).toBe(0)
  })

  it('converts percentage string to ratio', () => {
    expect(gapToPadding('50%', 100)).toBe(0.5)
    expect(gapToPadding('10%', 200)).toBe(0.1)
  })
})

describe('pointDefined', () => {
  it('returns true for valid finite points', () => {
    expect(pointDefined([0, 0])).toBe(true)
    expect(pointDefined([10, 20])).toBe(true)
  })

  it('returns false when x is NaN', () => {
    expect(pointDefined([NaN, 10])).toBe(false)
  })

  it('returns false when y is NaN', () => {
    expect(pointDefined([10, NaN])).toBe(false)
  })

  it('returns false for non-number values', () => {
    expect(pointDefined([undefined as any, 10])).toBe(false)
    expect(pointDefined([10, null as any])).toBe(false)
  })
})
