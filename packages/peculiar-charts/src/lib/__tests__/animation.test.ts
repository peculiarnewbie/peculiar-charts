import { afterEach, describe, expect, it, vi } from "vitest";
import { createRoot, createSignal } from "solid-js";
import {
  createTweened,
  createTweenedArrayStart,
  interpolateNumber,
  interpolatePoint,
  resolveAnimation,
} from "../animation";

afterEach(() => vi.unstubAllGlobals());

describe("animation lifecycle", () => {
  it("removes its reduced-motion listener when its reactive owner is disposed", () => {
    const addEventListener = vi.fn();
    const removeEventListener = vi.fn();
    vi.stubGlobal(
      "matchMedia",
      vi.fn(() => ({ matches: false, addEventListener, removeEventListener })),
    );

    let dispose!: () => void;
    createRoot((cleanup) => {
      dispose = cleanup;
      const [source] = createSignal(0);
      createTweened(
        source,
        () => resolveAnimation(false),
        (a, b, t) => a + (b - a) * t,
      );
    });

    expect(addEventListener).toHaveBeenCalledWith("change", expect.any(Function));
    dispose();
    expect(removeEventListener).toHaveBeenCalledWith("change", expect.any(Function));
  });
});

describe("resolveAnimation", () => {
  it("returns enabled defaults for true", () => {
    const r = resolveAnimation(true);
    expect(r.enabled).toBe(true);
    expect(r.duration).toBe(400);
    expect(r.easing).toBe("ease-out");
    expect(r.delay).toBe(0);
    expect(r.enter).toEqual({ duration: 400, easing: "ease-out", delay: 0 });
    expect(r.exit).toEqual({ duration: 400, easing: "ease-out", delay: 0 });
  });

  it("returns disabled defaults for false/undefined", () => {
    const r = resolveAnimation(false);
    expect(r.enabled).toBe(false);
    expect(r.duration).toBe(400);

    const r2 = resolveAnimation(undefined);
    expect(r2.enabled).toBe(false);
  });

  it("merges partial options with defaults", () => {
    const r = resolveAnimation({ duration: 200 });
    expect(r.enabled).toBe("auto");
    expect(r.duration).toBe(200);
    expect(r.easing).toBe("ease-out");
    expect(r.delay).toBe(0);
  });

  it("inherits top-level values into phases", () => {
    const r = resolveAnimation({
      duration: 300,
      easing: "linear",
      delay: 50,
    });
    expect(r.enter).toEqual({ duration: 300, easing: "linear", delay: 50 });
    expect(r.exit).toEqual({ duration: 300, easing: "linear", delay: 50 });
  });

  it("phase overrides take precedence", () => {
    const r = resolveAnimation({
      duration: 300,
      enter: { duration: 500, easing: "ease-in" },
    });
    expect(r.enter.duration).toBe(500);
    expect(r.enter.easing).toBe("ease-in");
    expect(r.enter.delay).toBe(0); // inherited from top
    expect(r.exit.duration).toBe(300); // inherited from top
  });

  it("sets enabled to auto when not specified", () => {
    const r = resolveAnimation({ duration: 100 });
    expect(r.enabled).toBe("auto");
  });

  it("preserves explicit enabled value", () => {
    const r = resolveAnimation({ enabled: false, duration: 100 });
    expect(r.enabled).toBe(false);
  });

  it("preserves matchBy", () => {
    const r = resolveAnimation({ matchBy: "label" });
    expect(r.matchBy).toBe("label");
  });
});

describe("interpolateNumber", () => {
  it("returns a at t=0", () => {
    expect(interpolateNumber(0, 100, 0)).toBe(0);
  });

  it("returns b at t=1", () => {
    expect(interpolateNumber(0, 100, 1)).toBe(100);
  });

  it("returns midpoint at t=0.5", () => {
    expect(interpolateNumber(0, 100, 0.5)).toBe(50);
  });

  it("extrapolates beyond [0, 1]", () => {
    expect(interpolateNumber(0, 100, 2)).toBe(200);
    expect(interpolateNumber(0, 100, -1)).toBe(-100);
  });

  it("works with negative values", () => {
    expect(interpolateNumber(-50, 50, 0.5)).toBe(0);
  });
});

describe("interpolatePoint", () => {
  it("interpolates 2D points", () => {
    expect(interpolatePoint([0, 0], [100, 200], 0)).toEqual([0, 0]);
    expect(interpolatePoint([0, 0], [100, 200], 1)).toEqual([100, 200]);
    expect(interpolatePoint([0, 0], [100, 200], 0.5)).toEqual([50, 100]);
  });

  it("handles negative coordinates", () => {
    expect(interpolatePoint([-10, -20], [10, 20], 0.5)).toEqual([0, 0]);
  });
});

describe("createTweenedArrayStart", () => {
  const enter = (target: number) => -target;

  it("matches by index when no keys are provided", () => {
    expect(createTweenedArrayStart([10, 20], [1, 2, 3], enter)).toEqual([10, 20, -3]);
  });

  it("matches reordered values by key", () => {
    expect(
      createTweenedArrayStart([10, 20, 30], [1, 2, 3], enter, ["a", "b", "c"], ["c", "a", "b"]),
    ).toEqual([30, 10, 20]);
  });

  it("uses enter values for new keys", () => {
    expect(
      createTweenedArrayStart([10, 20], [1, 2, 3], enter, ["a", "b"], ["b", "c", "a"]),
    ).toEqual([20, -2, 10]);
  });

  it("matches duplicate keys only once", () => {
    expect(
      createTweenedArrayStart([10, 20], [1, 2, 3], enter, ["a", "a"], ["a", "a", "a"]),
    ).toEqual([10, 20, -3]);
  });
});
