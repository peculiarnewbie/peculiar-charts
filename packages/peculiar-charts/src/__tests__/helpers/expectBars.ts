import { expect } from "vitest";

interface ExpectedBar {
  x?: string | number;
  y?: string | number;
  width?: string | number;
  height?: string | number;
  fill?: string;
  stroke?: string;
}

export function expectBars(container: Element, expected: ExpectedBar[]): void {
  const bars = container.querySelectorAll("[data-pc-bar]");
  expect(bars).toHaveLength(expected.length);

  expected.forEach((exp, i) => {
    const rect = bars[i];
    if (exp.x !== undefined) expect(rect).toHaveAttribute("x", String(exp.x));
    if (exp.y !== undefined) expect(rect).toHaveAttribute("y", String(exp.y));
    if (exp.width !== undefined) expect(rect).toHaveAttribute("width", String(exp.width));
    if (exp.height !== undefined) expect(rect).toHaveAttribute("height", String(exp.height));
    if (exp.fill !== undefined) expect(rect).toHaveAttribute("fill", exp.fill);
    if (exp.stroke !== undefined) expect(rect).toHaveAttribute("stroke", exp.stroke);
  });
}
