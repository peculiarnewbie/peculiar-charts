import { resolveBarConfig } from "../barConfig";
import { describe, expect, it } from "vitest";

describe("resolveBarConfig", () => {
  it("merges partial configuration property by property", () => {
    expect(resolveBarConfig({ barGap: 4 })).toEqual({
      bandGap: "10%",
      barGap: 4,
      barSize: undefined,
      maxBarSize: undefined,
    });
  });

  it.each([Number.NaN, Number.POSITIVE_INFINITY, -1, "ten%", "-5%", "10px"])(
    "rejects invalid size %s",
    (value) => {
      expect(() => resolveBarConfig({ bandGap: value as never })).toThrow(/barConfig\.bandGap/);
    },
  );

  it("accepts fractional percentages", () => {
    expect(resolveBarConfig({ bandGap: "10.5%" }).bandGap).toBe("10.5%");
  });
});
