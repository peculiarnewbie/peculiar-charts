/**
 * Default categorical palette. Series are assigned a colour by registration
 * order; it is exposed through the series registry for legends/tooltips but
 * never forced onto a series element — components stay unstyled by default.
 */
export const DEFAULT_PALETTE = [
  '#3b82f6', // blue-500
  '#ef4444', // red-500
  '#22c55e', // green-500
  '#a855f7', // purple-500
  '#f59e0b', // amber-500
  '#06b6d4', // cyan-500
  '#ec4899', // pink-500
  '#84cc16', // lime-500
  '#f97316', // orange-500
  '#14b8a6', // teal-500
]

export const paletteColor = (order: number) =>
  DEFAULT_PALETTE[order % DEFAULT_PALETTE.length]!
