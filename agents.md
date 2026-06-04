See [docs/patterns/solid-js.md](docs/patterns/solid-js.md) for SolidJS patterns and reactivity conventions used in this codebase.

## Reference clones

Read-only upstream repos for comparison — clone under `references/` (gitignored). See
[docs/references.md](docs/references.md) for paths and clone commands.

| Library | Path when cloned |
|---|---|
| [solid-charts](https://github.com/corvudev/solid-charts) | `references/solid-charts/` |
| [recharts](https://github.com/recharts/recharts) | `references/recharts/` |
| [ag-charts](https://github.com/ag-grid/ag-charts) | `references/ag-charts/` |

[solid-charts](https://github.com/corvudev/solid-charts) is the primary upstream inspiration —
peculiar-charts extends it with exported hooks, animation, richer tooltips, polar/radar, and
more series types. Use [recharts](https://github.com/recharts/recharts) when designing
extensibility parity (`docs/extensibility.md`).
