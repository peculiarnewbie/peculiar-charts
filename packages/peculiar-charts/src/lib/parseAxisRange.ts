/**
 * Parses a domain expression string into a resolver function.
 *
 * Supported syntax:
 * - `"dataMin"` / `"dataMax"` — the computed data bound
 * - `"dataMin - N"` / `"dataMax + N"` — data bound ± a numeric offset
 *
 * @returns A resolver `(dataMin, dataMax) => number`, or `null` if the
 *   expression is not a recognised domain string.
 */
export type DomainExpression =
  | `dataMin`
  | `dataMax`
  | `dataMin - ${number}`
  | `dataMax + ${number}`;

const RE = /^data(Min|Max)\s*([+-])?\s*([\d.]+)?$/;

export function parseAxisRange(
  expr: string,
): ((dataMin: number, dataMax: number) => number) | null {
  const m = RE.exec(expr.trim());
  if (!m) return null;

  const bound = m[1] === "Min" ? "min" : "max";
  const op = m[2];
  const num = m[3] !== undefined ? +m[3] : undefined;

  return (dataMin: number, dataMax: number) => {
    const base = bound === "min" ? dataMin : dataMax;
    if (op === "-" && num !== undefined) return base - num;
    if (op === "+" && num !== undefined) return base + num;
    return base;
  };
}

/**
 * Resolves a single axis range value. If it's a number, returns it directly.
 * If it's the special string `'min'` or `'max'`, returns `undefined` so the
 * caller can fall back to the data-derived bound. If it's a domain expression
 * string, evaluates it against the data bounds.
 */
export function resolveRangeValue(
  value: number | "min" | "max" | string,
  dataMin: number,
  dataMax: number,
): number | undefined {
  if (typeof value === "number") return value;
  if (value === "min") return undefined;
  if (value === "max") return undefined;
  const fn = parseAxisRange(value);
  if (fn) return fn(dataMin, dataMax);
  return undefined;
}
