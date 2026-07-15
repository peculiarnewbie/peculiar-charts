import Curve from "../Curve";
import { render } from "@solidjs/testing-library";
import { describe, expect, it } from "vitest";

const pathFor = (props: Parameters<typeof Curve>[0]) => {
  const result = render(() => (
    <svg>
      <Curve {...props} />
    </svg>
  ));
  const path = result.container.querySelector("path")?.getAttribute("d");
  result.unmount();
  return path;
};

describe("Curve area baseline alignment", () => {
  it.each([
    {
      position: "start",
      points: [
        [Number.NaN, Number.NaN],
        [10, 11],
        [20, 21],
      ] as [number, number][],
      expected: "M10,11L20,21L20,120L10,110Z",
    },
    {
      position: "middle",
      points: [
        [0, 1],
        [Number.NaN, Number.NaN],
        [20, 21],
      ] as [number, number][],
      expected: "M0,1L0,100Z M20,21L20,120Z",
    },
    {
      position: "end",
      points: [
        [0, 1],
        [10, 11],
        [Number.NaN, Number.NaN],
      ] as [number, number][],
      expected: "M0,1L10,11L10,110L0,100Z",
    },
  ])("keeps the baseline paired with points after a $position gap", ({ points, expected }) => {
    expect(pathFor({ points, baseLine: [100, 110, 120] })).toBe(expected);
  });

  it("keeps baseline indexes aligned when connecting across gaps", () => {
    expect(
      pathFor({
        points: [
          [0, 1],
          [Number.NaN, Number.NaN],
          [20, 21],
        ],
        baseLine: [100, 110, 120],
        connectNulls: true,
      }),
    ).toBe("M0,1L20,21L20,120L0,100Z");
  });

  it("keeps horizontal baselines paired with their points", () => {
    expect(
      pathFor({
        points: [
          [1, 0],
          [Number.NaN, Number.NaN],
          [21, 20],
        ],
        baseLine: [100, 110, 120],
        connectNulls: true,
        layout: "horizontal",
      }),
    ).toBe("M1,0L21,20L120,20L100,0Z");
  });
});
