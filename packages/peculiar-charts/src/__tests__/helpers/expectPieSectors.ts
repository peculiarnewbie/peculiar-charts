import { expect } from 'vitest'

interface ExpectedPieSlice {
  d?: string
  fill?: string
  key?: string | number
  index?: string | number
}

export function expectPieSectors(
  container: Element,
  expected: ExpectedPieSlice[],
): void {
  const slices = container.querySelectorAll('[data-pc-pie-slice]')
  expect(slices).toHaveLength(expected.length)

  expected.forEach((exp, i) => {
    const path = slices[i]
    if (exp.d !== undefined) expect(path).toHaveAttribute('d', exp.d)
    if (exp.fill !== undefined) expect(path).toHaveAttribute('fill', exp.fill)
    if (exp.key !== undefined)
      expect(path).toHaveAttribute('data-key', String(exp.key))
    if (exp.index !== undefined)
      expect(path).toHaveAttribute('data-index', String(exp.index))
  })
}
