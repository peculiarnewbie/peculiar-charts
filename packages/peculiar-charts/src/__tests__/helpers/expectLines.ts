import { expect } from 'vitest'

interface ExpectedLine {
  d?: string
  stroke?: string
  fill?: string
}

export function expectLines(
  container: Element,
  expected: ExpectedLine[],
): void {
  const lines = container.querySelectorAll('[data-pc-line]')
  expect(lines).toHaveLength(expected.length)

  expected.forEach((exp, i) => {
    const path = lines[i]
    if (exp.d !== undefined) expect(path).toHaveAttribute('d', exp.d)
    if (exp.stroke !== undefined)
      expect(path).toHaveAttribute('stroke', exp.stroke)
    if (exp.fill !== undefined) expect(path).toHaveAttribute('fill', exp.fill)
  })
}
