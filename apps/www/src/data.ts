// Deterministic sample datasets shared across demos.

/** A week of café sales — used by most line / bar / pie demos. */
export const sales = [
  { day: 'Mon', coffee: 42, tea: 60, revenue: 3200, nulls: 42 },
  { day: 'Tue', coffee: 55, tea: 48, revenue: 2800, nulls: 55 },
  { day: 'Wed', coffee: 38, tea: 72, revenue: 4100, nulls: 38 },
  { day: 'Thu', coffee: 71, tea: 65, revenue: 3900, nulls: null },
  { day: 'Fri', coffee: 88, tea: 90, revenue: 5200, nulls: 88 },
  { day: 'Sat', coffee: 64, tea: 81, revenue: 4700, nulls: 64 },
  { day: 'Sun', coffee: 50, tea: 58, revenue: 3000, nulls: 50 },
]

/** Monthly price samples on a real time axis (epoch-ms x values). */
export const priceSeries = Array.from({ length: 12 }, (_, i) => ({
  t: Date.UTC(2024, i, 1),
  price: Math.round(120 + Math.sin(i / 1.7) * 40 + i * 3),
}))

/** A signal that crosses zero — for fill-by-value areas. */
export const wave = Array.from({ length: 13 }, (_, i) => ({
  m: `M${i + 1}`,
  v: Math.round(Math.sin(i / 1.5) * 60),
}))

/** Solid actuals then a dashed projected tail, overlapping at the seam. */
export const forecast = Array.from({ length: 12 }, (_, i) => {
  const base = 40 + Math.round(Math.sin(i / 1.3) * 16)
  return {
    m: `M${i + 1}`,
    actual: i <= 7 ? base : null,
    projected: i >= 7 ? base + (i - 7) * 5 : null,
  }
})

/** Scatter / bubble points: x = price, y = rating, z = sales volume. */
export const bubbles = Array.from({ length: 18 }, (_, i) => ({
  price: Math.round(10 + ((i * 53) % 90)),
  rating: Math.round((30 + Math.abs(Math.sin(i / 1.6) * 65)) * 10) / 10,
  volume: Math.round(50 + ((i * 137) % 950)),
}))

export const monthLabel = (t: Date) =>
  new Date(t).toLocaleDateString('en', { month: 'short' })
