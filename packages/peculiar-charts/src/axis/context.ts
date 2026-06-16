import type { Scale } from "@src/lib/scale";
import { type Accessor, createContext, useContext } from "solid-js";

export type AxisContextType = {
  axisId: Accessor<string>;
  axis: Accessor<"x" | "y">;
  position: Accessor<"top" | "right" | "bottom" | "left">;
  mirror: Accessor<boolean>;
  tickFormatter: Accessor<(value: any) => string>;
  scale: Accessor<Scale>;
  ticks: Accessor<any[]>;
  /** Ticks that survived label-collision filtering (shared by Label/Grid/Mark). */
  labelTicks: Accessor<any[]>;
  setLabelTicks: (ticks: any[]) => void;
};

export const AxisContext = createContext<AxisContextType>();

export const useAxisContext = () => {
  const context = useContext(AxisContext);
  if (!context) {
    throw new Error(
      "[peculiar-charts]: Axis context not found. Make sure to wrap Axis components in <Axis>",
    );
  }
  return context;
};
