import { type Accessor, createContext, useContext } from "solid-js";

export type PolarLayout = {
  cx: Accessor<number>;
  cy: Accessor<number>;
  innerRadius: Accessor<number>;
  outerRadius: Accessor<number>;
  startAngle: Accessor<number>;
  endAngle: Accessor<number>;
};

export const PolarLayoutContext = createContext<PolarLayout>();

export const usePolarLayout = () => {
  const ctx = useContext(PolarLayoutContext);
  if (!ctx) {
    throw new Error(
      "[peculiar-charts]: Polar layout not found. Wrap polar components in <PolarLayout>",
    );
  }
  return ctx;
};
