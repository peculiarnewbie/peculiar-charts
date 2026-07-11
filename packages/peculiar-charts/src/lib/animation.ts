import { type Accessor, createEffect, createSignal, onCleanup, untrack } from "solid-js";

/**
 * Animation metadata forwarded to custom chart shapes.
 *
 * These props let a shape react to the current animation state without needing
 * to know how its parent chart component computes the animated geometry.
 */
export type ShapeAnimationProps = {
  /**
   * Raw animation progress in the `[0, 1]` range (before easing).
   * `0` at the start of the animation, `1` at the end.
   */
  animationElapsedTime?: number;
  /** Whether the series is currently animating. */
  isAnimating?: boolean;
  /**
   * Whether this is the initial entrance animation (first render).
   * Subsequent data-change animations have `isEntrance = false`.
   */
  isEntrance?: boolean;
};

export type AnimationEasing =
  | "linear"
  | "ease"
  | "ease-in"
  | "ease-out"
  | "ease-in-out"
  | `cubic-bezier(${number}, ${number}, ${number}, ${number})`;

export type PhaseConfig = {
  duration?: number;
  easing?: AnimationEasing;
  delay?: number;
};

export type AnimationMatchBy<TDatum = unknown> =
  | "index"
  | string
  | ((datum: TDatum, index: number, data: TDatum[]) => unknown);

export type AnimationOptions =
  | boolean
  | {
      enabled?: boolean | "auto";
      duration?: number;
      easing?: AnimationEasing;
      delay?: number;
      enter?: PhaseConfig;
      exit?: PhaseConfig;
      /**
       * Custom interpolation function for animated geometry.
       * Receives the start value, end value, and progress `t` in `[0, 1]`.
       * Called per-element (e.g. per `[x, y]` point for Line/Area).
       */
      interpolate?: (from: any, to: any, t: number) => any;
      /**
       * Match old and new animated geometry by a stable datum key when data is
       * inserted, removed, or reordered. A string reads that key from each
       * datum; a function receives `(datum, index, data)`.
       */
      matchBy?: AnimationMatchBy<any>;
    };

export type ResolvedPhaseConfig = {
  duration: number;
  easing: AnimationEasing;
  delay: number;
};

export type ResolvedAnimationOptions = {
  enabled: boolean | "auto";
  duration: number;
  easing: AnimationEasing;
  delay: number;
  enter: ResolvedPhaseConfig;
  exit: ResolvedPhaseConfig;
  interpolate?: (from: any, to: any, t: number) => any;
  matchBy?: AnimationMatchBy<any>;
};

const mergePhase = (
  phase: PhaseConfig | undefined,
  top: { duration: number; easing: AnimationEasing; delay: number },
): ResolvedPhaseConfig => ({
  duration: phase?.duration ?? top.duration,
  easing: phase?.easing ?? top.easing,
  delay: phase?.delay ?? top.delay,
});

export const resolveAnimation = (
  options: AnimationOptions | undefined,
): ResolvedAnimationOptions => {
  if (options === true) {
    const top = { duration: 400, easing: "ease-out" as const, delay: 0 };
    return {
      enabled: true,
      ...top,
      enter: { ...top },
      exit: { ...top },
    };
  }
  if (!options) {
    const top = { duration: 400, easing: "ease-out" as const, delay: 0 };
    return {
      enabled: false,
      ...top,
      enter: { ...top },
      exit: { ...top },
    };
  }
  const top = {
    duration: options.duration ?? 400,
    easing: options.easing ?? "ease-out",
    delay: options.delay ?? 0,
  };
  return {
    enabled: options.enabled ?? "auto",
    ...top,
    enter: mergePhase(options.enter, top),
    exit: mergePhase(options.exit, top),
    interpolate: options.interpolate,
    matchBy: options.matchBy,
  };
};

export const interpolateNumber = (a: number, b: number, t: number): number => a + (b - a) * t;

export const interpolatePoint = (
  a: [number, number],
  b: [number, number],
  t: number,
): [number, number] => [interpolateNumber(a[0], b[0], t), interpolateNumber(a[1], b[1], t)];

type BezierFn = (t: number) => number;

const bezier = (x1: number, y1: number, x2: number, y2: number): BezierFn => {
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;

  const sampleX = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sampleY = (t: number) => ((ay * t + by) * t + cy) * t;

  const solve = (x: number): number => {
    let t = x;
    for (let i = 0; i < 8; i++) {
      const err = sampleX(t) - x;
      if (Math.abs(err) < 1e-6) break;
      const dx = (3 * ax * t + 2 * bx) * t + cx;
      if (Math.abs(dx) < 1e-6) break;
      t -= err / dx;
    }
    return sampleY(t);
  };

  return solve;
};

const EASINGS: Record<string, BezierFn> = {
  linear: (t: number) => t,
  ease: bezier(0.25, 0.1, 0.25, 1),
  "ease-in": bezier(0.42, 0, 1, 1),
  "ease-out": bezier(0, 0, 0.58, 1),
  "ease-in-out": bezier(0.42, 0, 0.58, 1),
};

const CUBIC_BEZIER_RE =
  /^cubic-bezier\(\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*\)$/;

const parseCubicBezier = (value: string): BezierFn | undefined => {
  const m = CUBIC_BEZIER_RE.exec(value);
  if (!m) return undefined;
  return bezier(+m[1]!, +m[2]!, +m[3]!, +m[4]!);
};

const easingCache = new Map<string, BezierFn>();

const getEasingFn = (easing: AnimationEasing): BezierFn => {
  const cached = easingCache.get(easing);
  if (cached) return cached;
  const fn = EASINGS[easing as AnimationEasing] ?? parseCubicBezier(easing) ?? EASINGS["ease-out"]!;
  easingCache.set(easing, fn);
  return fn;
};

const createReducedMotion = (): Accessor<boolean> => {
  if (typeof window === "undefined") return () => false;
  const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
  const [reduced, setReduced] = createSignal(mql.matches);
  const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
  mql.addEventListener("change", handler);
  onCleanup(() => mql.removeEventListener("change", handler));
  return reduced;
};

export const createTweened = <T>(
  source: Accessor<T>,
  options: Accessor<ResolvedAnimationOptions>,
  interpolate: (a: T, b: T, t: number) => T,
): Accessor<T> => {
  const reducedMotion = createReducedMotion();
  const initial = source();
  const [animated, setAnimated] = createSignal<T>(initial);
  const [target, setTarget] = createSignal<T>(initial);
  const [startValue, setStartValue] = createSignal<T>(initial);

  let raf: number | undefined;
  let startTime: number | undefined;

  const cancelAnim = () => {
    if (raf !== undefined) {
      cancelAnimationFrame(raf);
      raf = undefined;
    }
    startTime = undefined;
  };

  const animate = (duration: number, easing: BezierFn, delay: number) => {
    cancelAnim();
    const run = () => {
      raf = requestAnimationFrame((now) => {
        if (startTime === undefined) startTime = now - delay;
        const elapsed = now - startTime;
        if (elapsed < 0) {
          raf = undefined;
          run();
          return;
        }
        const progress = duration > 0 ? Math.min(elapsed / duration, 1) : 1;
        const t = easing(progress);
        setAnimated(() => interpolate(untrack(startValue), untrack(target), t));
        if (progress < 1) {
          raf = undefined;
          run();
        } else {
          cancelAnim();
        }
      });
    };
    run();
  };

  createEffect(() => {
    source();
    const opts = options();

    setStartValue(() => untrack(animated));
    setTarget(() => source());

    const disabled =
      opts.enabled === false ||
      (opts.enabled === "auto" && untrack(reducedMotion)) ||
      opts.duration <= 0;

    if (disabled) {
      cancelAnim();
      setAnimated(() => source());
      return;
    }

    animate(opts.duration, getEasingFn(opts.easing), opts.delay);
  });

  onCleanup(cancelAnim);

  return animated;
};

export const createTweenedArray = <T>(
  source: Accessor<T[]>,
  options: Accessor<ResolvedAnimationOptions>,
  interpolate: (a: T, b: T, t: number) => T,
  enterValue: (target: T, index: number, prev: T[]) => T,
  onProgress?: (elapsed: number) => void,
  matchKeys?: Accessor<unknown[] | undefined>,
): Accessor<T[]> => {
  const reducedMotion = createReducedMotion();
  const initial = source();
  const initialKeys = matchKeys?.();
  const [animated, setAnimated] = createSignal<T[]>(initial);
  const [target, setTarget] = createSignal<T[]>(initial);
  const [startValue, setStartValue] = createSignal<T[]>(initial);
  let targetKeys = initialKeys;

  let raf: number | undefined;
  let startTime: number | undefined;

  const cancelAnim = () => {
    if (raf !== undefined) {
      cancelAnimationFrame(raf);
      raf = undefined;
    }
    startTime = undefined;
  };

  const animate = (duration: number, easing: BezierFn, delay: number) => {
    cancelAnim();
    const run = () => {
      raf = requestAnimationFrame((now) => {
        if (startTime === undefined) startTime = now - delay;
        const elapsed = now - startTime;
        if (elapsed < 0) {
          raf = undefined;
          run();
          return;
        }
        const progress = duration > 0 ? Math.min(elapsed / duration, 1) : 1;
        const t = easing(progress);
        const from = untrack(startValue);
        const to = untrack(target);
        const len = Math.min(from.length, to.length);
        const arr: T[] = [];
        for (let i = 0; i < len; i++) arr.push(interpolate(from[i]!, to[i]!, t));
        for (let i = len; i < to.length; i++) arr.push(to[i]!);
        setAnimated(arr);
        onProgress?.(progress);
        if (progress < 1) {
          raf = undefined;
          run();
        } else {
          cancelAnim();
        }
      });
    };
    run();
  };

  createEffect(() => {
    const src = source();
    const nextKeys = matchKeys?.();
    const opts = options();
    const prev = untrack(animated);

    setStartValue(() => createTweenedArrayStart(prev, src, enterValue, targetKeys, nextKeys));
    setTarget(() => src);
    targetKeys = nextKeys;

    const disabled =
      opts.enabled === false ||
      (opts.enabled === "auto" && untrack(reducedMotion)) ||
      opts.duration <= 0;

    if (disabled) {
      cancelAnim();
      setAnimated(() => src);
      onProgress?.(1);
      return;
    }

    animate(opts.duration, getEasingFn(opts.easing), opts.delay);
  });

  onCleanup(cancelAnim);

  return animated;
};

export const createTweenedArrayStart = <T>(
  previous: T[],
  target: T[],
  enterValue: (target: T, index: number, prev: T[]) => T,
  previousKeys?: unknown[],
  targetKeys?: unknown[],
): T[] => {
  if (!previousKeys || !targetKeys) {
    return target.map((item, index) =>
      index < previous.length ? previous[index]! : enterValue(item, index, previous),
    );
  }

  const used = new Set<number>();
  return target.map((item, index) => {
    const key = targetKeys[index];
    const previousIndex = previousKeys.findIndex(
      (previousKey, candidateIndex) => !used.has(candidateIndex) && Object.is(previousKey, key),
    );
    if (previousIndex >= 0) {
      used.add(previousIndex);
      return previous[previousIndex]!;
    }
    return enterValue(item, index, previous);
  });
};

export type PresenceMode = "enter" | "update" | "exit";

export type PresenceItem<T> = {
  value: T;
  mode: PresenceMode;
};

type InternalPresenceItem<T> = {
  value: T;
  target: T;
  mode: PresenceMode;
  startTime: number;
  duration: number;
  easing: BezierFn;
  delay: number;
};

export const createPresence = <T>(
  source: Accessor<T[]>,
  options: Accessor<ResolvedAnimationOptions>,
  interpolate: (a: T, b: T, t: number) => T,
  enterValue: (target: T) => T,
  exitValue: (current: T) => T,
): Accessor<PresenceItem<T>[]> => {
  const reducedMotion = createReducedMotion();
  const [items, setItems] = createSignal<InternalPresenceItem<T>[]>([]);

  let raf: number | undefined;

  const cancelAnim = () => {
    if (raf !== undefined) {
      cancelAnimationFrame(raf);
      raf = undefined;
    }
  };

  const tick = (now: number) => {
    const current = untrack(items);
    let hasActive = false;
    const next: InternalPresenceItem<T>[] = [];

    for (const item of current) {
      const elapsed = now - item.startTime + item.delay;
      if (elapsed < 0) {
        next.push(item);
        hasActive = true;
        continue;
      }
      const progress = item.duration > 0 ? Math.min(elapsed / item.duration, 1) : 1;
      const t = item.easing(progress);
      const value = interpolate(item.value, item.target, t);
      if (progress < 1) {
        next.push({ ...item, value });
        hasActive = true;
      } else if (item.mode !== "exit") {
        next.push({
          value: item.target,
          target: item.target,
          mode: item.mode,
          startTime: item.startTime,
          duration: item.duration,
          easing: item.easing,
          delay: item.delay,
        });
      }
    }

    setItems(next);

    if (hasActive) {
      raf = requestAnimationFrame(tick);
    } else {
      raf = undefined;
    }
  };

  const start = () => {
    cancelAnim();
    raf = requestAnimationFrame(tick);
  };

  createEffect(() => {
    const src = source();
    const opts = options();

    const disabled =
      opts.enabled === false ||
      (opts.enabled === "auto" && untrack(reducedMotion)) ||
      opts.duration <= 0;

    const prev = untrack(items);

    if (disabled) {
      cancelAnim();
      setItems(
        src.map((v) => ({
          value: v,
          target: v,
          mode: "update" as const,
          startTime: 0,
          duration: 0,
          easing: EASINGS["ease-out"]!,
          delay: 0,
        })),
      );
      return;
    }

    const now = performance.now();
    const updateEasing = getEasingFn(opts.easing);
    const enterEasing = getEasingFn(opts.enter.easing);
    const exitEasing = getEasingFn(opts.exit.easing);
    const next: InternalPresenceItem<T>[] = [];

    const overlap = Math.min(prev.length, src.length);
    for (let i = 0; i < overlap; i++) {
      const prevItem = prev[i]!;
      if (prevItem.mode === "exit") {
        next.push({
          value: enterValue(src[i]!),
          target: src[i]!,
          mode: "enter",
          startTime: now,
          duration: opts.enter.duration,
          easing: enterEasing,
          delay: opts.enter.delay,
        });
      } else {
        next.push({
          value:
            prevItem.mode === "enter" || prevItem.mode === "update"
              ? prevItem.value
              : prevItem.target,
          target: src[i]!,
          mode: "update",
          startTime: now,
          duration: opts.duration,
          easing: updateEasing,
          delay: opts.delay,
        });
      }
    }

    for (let i = overlap; i < src.length; i++) {
      next.push({
        value: enterValue(src[i]!),
        target: src[i]!,
        mode: "enter",
        startTime: now,
        duration: opts.enter.duration,
        easing: enterEasing,
        delay: opts.enter.delay,
      });
    }

    for (let i = src.length; i < prev.length; i++) {
      const prevItem = prev[i]!;
      if (prevItem.mode === "exit") {
        next.push(prevItem);
      } else {
        const currentVal =
          prevItem.mode === "enter" || prevItem.mode === "update"
            ? prevItem.value
            : prevItem.target;
        next.push({
          value: currentVal,
          target: exitValue(currentVal),
          mode: "exit",
          startTime: now,
          duration: opts.exit.duration,
          easing: exitEasing,
          delay: opts.exit.delay,
        });
      }
    }

    setItems(next);
    start();
  });

  onCleanup(cancelAnim);

  return () =>
    items().map((item) => ({
      value: item.value,
      mode: item.mode,
    }));
};
