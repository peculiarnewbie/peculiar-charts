# Reference clones

Local copies of upstream chart libraries live under `references/` for side-by-side
comparison while designing peculiar-charts APIs. They are **not** part of the published
package and are **gitignored** — clone them yourself when you need them.

## Layout

| Path | Upstream | Use when |
|---|---|---|
| `references/solid-charts/` | [corvudev/solid-charts](https://github.com/corvudev/solid-charts) | SolidJS API shape, component composition, playground patterns |
| `references/recharts/` | [recharts/recharts](https://github.com/recharts/recharts) | Extensibility surface (hooks, render-props, `syncId`), polar/radar behaviour |
| `references/ag-charts/` | [ag-grid/ag-charts](https://github.com/ag-grid/ag-charts) | Animation / scene-graph ideas (Canvas, different model) |

## Clone commands

From the repo root:

```bash
mkdir -p references
git clone https://github.com/corvudev/solid-charts.git references/solid-charts
git clone https://github.com/recharts/recharts.git references/recharts
git clone https://github.com/ag-grid/ag-charts.git references/ag-charts
```

Shallow clones are fine for read-only grepping:

```bash
git clone --depth 1 https://github.com/corvudev/solid-charts.git references/solid-charts
```

## Citing paths in docs

When comparing implementations, use paths relative to those clones, for example:

- `references/solid-charts/packages/solid-charts/src/…`
- `references/recharts/src/polar/Radar.tsx`
- `references/ag-charts/packages/ag-charts-community/src/…`

Do **not** vendor clones at the repository root (`/solid-charts`, etc.) — keep everything
under `references/` so `.gitignore` stays predictable.

## Analysis docs

- `docs/extensibility.md` — extensibility comparison (hooks, render-props, custom series)
- `docs/feature-parity.md` — Line & Area chart feature parity vs Recharts' 33 examples
