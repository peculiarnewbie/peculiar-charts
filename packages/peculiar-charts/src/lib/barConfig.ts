import type { BarConfig } from "@src/components/context";

const DEFAULT_BAR_CONFIG: BarConfig = { bandGap: "10%", barGap: "10%" };
const PERCENTAGE = /^\d+(?:\.\d+)?%$/;

const isValidSize = (value: unknown): value is number | `${number}%` =>
  (typeof value === "number" && Number.isFinite(value) && value >= 0) ||
  (typeof value === "string" &&
    PERCENTAGE.test(value) &&
    Number.isFinite(Number.parseFloat(value)));

const optionalSize = (name: keyof BarConfig, value: unknown): number | `${number}%` | undefined => {
  if (value === undefined) return undefined;
  if (isValidSize(value)) return value;
  throw new Error(
    `[peculiar-charts]: barConfig.${name} must be a finite non-negative number or percentage`,
  );
};

/** Deeply resolves and validates the public partial bar configuration. */
export const resolveBarConfig = (config: Partial<BarConfig> | undefined): BarConfig => ({
  bandGap: optionalSize("bandGap", config?.bandGap) ?? DEFAULT_BAR_CONFIG.bandGap,
  barGap: optionalSize("barGap", config?.barGap) ?? DEFAULT_BAR_CONFIG.barGap,
  barSize: optionalSize("barSize", config?.barSize),
  maxBarSize: optionalSize("maxBarSize", config?.maxBarSize),
});
