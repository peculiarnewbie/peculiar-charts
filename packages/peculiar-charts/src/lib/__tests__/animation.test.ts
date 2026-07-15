import { afterEach, describe, expect, it, vi } from "vitest";
import { createRoot, createSignal } from "solid-js";
import {
  createTweened,
  createTweenedArrayStart,
  createPresence,
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

describe("animation delays", () => {
  const frameHarness = () => {
    let id = 0;
    const callbacks = new Map<number, FrameRequestCallback>();
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
      callbacks.set(++id, callback);
      return id;
    });
    vi.stubGlobal("cancelAnimationFrame", (frameId: number) => callbacks.delete(frameId));
    const step = (now: number) => {
      for (const [frameId, callback] of Array.from(callbacks)) {
        callbacks.delete(frameId);
        callback(now);
      }
    };
    return { step };
  };

  it("holds a tween at its start value until the top-level delay elapses", () => {
    const { step } = frameHarness();
    const [source, setSource] = createSignal(0);
    let value!: () => number;
    let dispose!: () => void;
    createRoot((cleanup) => {
      dispose = cleanup;
      value = createTweened(
        source,
        () => resolveAnimation({ enabled: true, duration: 100, easing: "linear", delay: 50 }),
        interpolateNumber,
      );
    });
    setSource(10);
    step(100);
    step(149);
    expect(value()).toBe(0);
    step(150);
    expect(value()).toBe(0);
    step(200);
    expect(value()).toBe(5);
    dispose();
  });

  it("holds entering items until the enter delay elapses", () => {
    const { step } = frameHarness();
    vi.spyOn(performance, "now").mockReturnValue(100);
    let dispose!: () => void;
    let items!: ReturnType<typeof createPresence<number>>;
    createRoot((cleanup) => {
      dispose = cleanup;
      items = createPresence(
        () => [10],
        () =>
          resolveAnimation({
            enabled: true,
            duration: 100,
            easing: "linear",
            enter: { delay: 50 },
          }),
        interpolateNumber,
        () => 0,
        () => 0,
      );
    });
    step(100);
    step(149);
    expect(items()[0]?.value).toBe(0);
    step(150);
    expect(items()[0]?.value).toBe(0);
    step(200);
    expect(items()[0]?.value).toBe(5);
    dispose();
  });

  it("holds exiting items until the exit delay elapses", () => {
    const { step } = frameHarness();
    const now = vi.spyOn(performance, "now").mockReturnValue(100);
    const [source, setSource] = createSignal([10]);
    let dispose!: () => void;
    let items!: ReturnType<typeof createPresence<number>>;
    createRoot((cleanup) => {
      dispose = cleanup;
      items = createPresence(
        source,
        () =>
          resolveAnimation({
            enabled: true,
            duration: 100,
            easing: "linear",
            enter: { duration: 1 },
            exit: { delay: 40 },
          }),
        interpolateNumber,
        () => 0,
        () => 0,
      );
    });
    step(100);
    step(102);
    expect(items()[0]?.value).toBe(10);
    now.mockReturnValue(200);
    setSource([]);
    step(200);
    step(239);
    expect(items()[0]?.value).toBe(10);
    step(240);
    expect(items()[0]?.value).toBe(10);
    step(290);
    expect(items()[0]?.value).toBe(5);
    dispose();
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
