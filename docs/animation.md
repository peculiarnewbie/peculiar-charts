# Animation

peculiar-charts provides built-in, opt-in animation via the `animation` prop on every series
component. Animation is implemented as Solid-native reactive tweening — no imperative DOM mutation,
no external animation library.

---

## Public API

Every series (`Bar`, `Line`, `Area`, `Pie`, `Point`, `Bubble`) accepts an `animation` prop:

```ts
type AnimationEasing =
  | "linear"
  | "ease"
  | "ease-in"
  | "ease-out"
  | "ease-in-out"
  | `cubic-bezier(${number}, ${number}, ${number}, ${number})`

type PhaseConfig = {
  duration?: number
  easing?: AnimationEasing
  delay?: number
}

type AnimationOptions =
  | boolean
  | {
      enabled?: boolean | "auto"
      duration?: number
      easing?: AnimationEasing
      delay?: number
      enter?: PhaseConfig
      exit?: PhaseConfig
    }
```

Example usage:

```tsx
<Bar animation />
<Line animation={{ duration: 500, easing: "ease-out" }} />
<Pie animation={{ duration: 700 }} />
<Bar animation={{ easing: "cubic-bezier(0.68, -0.55, 0.265, 1.55)" }} />
<Bar
  animation={{
    duration: 400,
    easing: "ease-out",
    enter: { duration: 600, easing: "ease" },
    exit: { duration: 300, easing: "ease-in" },
  }}
/>
```

Defaults when `animation` is `true`:

```ts
{ enabled: "auto", duration: 400, easing: "ease-out", delay: 0 }
```

`enabled: "auto"` disables animation when the user has requested reduced motion
(`prefers-reduced-motion: reduce`).

---

## Architecture

### Core primitives (`lib/animation.ts`)

- **`createTweened<T>(source, options, interpolate)`** — rAF-based reactive tween for a single
  value. Cancels/restarts when the source changes. Resolves immediately when disabled.
- **`createTweenedArray<T>(source, options, interpolate, enterValue)`** — Array variant. Handles
  enter animations via `enterValue` callback. Interpolates overlapping elements; new elements beyond
  the previous length get the target value directly.
- **`createPresence<T, K>(items, options)`** — Tracks array items by key across updates. Retains
  removed items in the output until their exit animation completes. Each item carries an `exiting`
  flag and a `mode` (`"enter"` / `"update"` / `"exit"`).
- **`resolveAnimation(options)`** — Normalizes `AnimationOptions` to `ResolvedAnimationOptions`.
- **`interpolateNumber` / `interpolatePoint`** — Linear interpolation helpers.
- Easing: named presets (`linear`, `ease`, `ease-in`, `ease-out`, `ease-in-out`) plus custom
  `cubic-bezier(...)` strings. Implemented with a Newton-Raphson cubic-bezier solver.

### Series integration

Each series computes final SVG geometry through reactive memos, then passes it through
`createTweenedArray` (or `createPresence` for exit-capable series) before rendering:

```
data → geometry memo → createTweenedArray/createPresence → <svg elements>
```

| Series   | Animated properties                        | Enter animation                | Exit animation              |
| -------- | ------------------------------------------ | ------------------------------ | --------------------------- |
| Bar      | `x`, `y`, `width`, `height`               | Grow from baseline (h=0)       | Shrink to baseline (h=0)    |
| Point    | `cx`, `cy`, `r`                           | Scale from r=0                 | Scale to r=0                |
| Bubble   | `cx`, `cy`, `r`                           | Scale from r=0                 | Scale to r=0                |
| Pie      | `startAngle`, `endAngle`                   | Grow from zero angular span    | Shrink to zero angular span |
| Line     | `[x, y]` point coordinates                 | Points appear at final position | N/A (path snaps)            |
| Area     | `[x, y]` points + baseline                 | Points appear at final position | N/A (path snaps)            |

Line and Area do not support per-point exit animations because the path would distort during the
transition. Use the `animation` prop for enter/update tweening only.

---

## Exported primitives

All animation primitives are exported from the package for custom series authors:

```ts
import {
  createTweened,
  createTweenedArray,
  createPresence,
  interpolateNumber,
  interpolatePoint,
  resolveAnimation,
} from "peculiar-charts"

// Types also exported: AnimationOptions, AnimationEasing, ResolvedAnimationOptions,
// PhaseConfig, ResolvedPhaseConfig, PresenceItem, PresenceMode
```

---

## References

### AG Charts

AG Charts is Canvas-based and owns a retained-mode scene graph. Its public API is intentionally
small (`animation: { enabled, duration }`). Internally it has a custom rAF animation system with
value interpolation, diff-aware phases, and series-level state machines. That architecture works
because AG Charts mutates scene graph nodes and re-renders dirty Canvas regions — more machinery
than peculiar-charts needs.

### Recharts

Recharts is SVG-based and closer to peculiar-charts' rendering model. Its public API is per-series
(`isAnimationActive`, `animationDuration`, `animationEasing`). Internally it uses its own rAF-based
animation layer: series track previous geometry and interpolate toward next geometry each frame.
This is the more relevant reference for peculiar-charts.

---

## Future work

- **Spring physics** — natural-feeling motion without explicit duration/easing.
- **Callbacks** — `onAnimationStart`, `onAnimationEnd` per series.
- **Draw-in effects** — stroke-dasharray reveal for Line/Area paths.
- **Path morphing** — smooth shape transitions for dramatically different geometries.
- **Global chart-level animation API** — shared config across all series.
- **Color interpolation** — animated fill/stroke transitions.
- **Staggered enter** — delay per-datum for cascading reveals.
