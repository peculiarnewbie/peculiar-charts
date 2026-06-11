import { expect } from "vitest";

interface ExpectedTick {
  text: string;
  x?: string | number;
  y?: string | number;
}

export function expectAxisTicks(container: Element, expected: ExpectedTick[]): void {
  const labels = container.querySelectorAll("[data-pc-axis-label]");
  expect(labels).toHaveLength(expected.length);

  expected.forEach((exp, i) => {
    const label = labels[i];
    expect(label).toHaveTextContent(exp.text);
    if (exp.x !== undefined) expect(label).toHaveAttribute("x", String(exp.x));
    if (exp.y !== undefined) expect(label).toHaveAttribute("y", String(exp.y));
  });
}
