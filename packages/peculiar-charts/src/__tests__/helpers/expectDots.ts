import { expect } from "vitest";

interface ExpectedDot {
  cx?: string | number;
  cy?: string | number;
  r?: string | number;
  fill?: string;
}

export function expectDots(container: Element, expected: ExpectedDot[]): void {
  const dots = container.querySelectorAll("[data-pc-dot]");
  expect(dots).toHaveLength(expected.length);

  expected.forEach((exp, i) => {
    const circle = dots[i];
    if (exp.cx !== undefined) expect(circle).toHaveAttribute("cx", String(exp.cx));
    if (exp.cy !== undefined) expect(circle).toHaveAttribute("cy", String(exp.cy));
    if (exp.r !== undefined) expect(circle).toHaveAttribute("r", String(exp.r));
    if (exp.fill !== undefined) expect(circle).toHaveAttribute("fill", exp.fill);
  });
}
