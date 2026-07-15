import type { AxisConfig, AxisOrientation, ChartContextType } from "@src/components/context";
import type { NumericExtent } from "@src/lib/extent";
import { resolveAxisDomain } from "@src/lib/resolveAxisDomain";
import { type Accessor, createSignal } from "solid-js";
import { isDev } from "solid-js/web";

const configsEqual = (left: AxisConfig, right: AxisConfig) =>
  left.orientation === right.orientation &&
  left.type === right.type &&
  left.dataKey === right.dataKey &&
  left.reverse === right.reverse &&
  left.allowDuplicatedCategory === right.allowDuplicatedCategory &&
  left.allowDataOverflow === right.allowDataOverflow &&
  left.range?.[0] === right.range?.[0] &&
  left.range?.[1] === right.range?.[1] &&
  left.padding?.top === right.padding?.top &&
  left.padding?.right === right.padding?.right &&
  left.padding?.bottom === right.padding?.bottom &&
  left.padding?.left === right.padding?.left;

const defaultConfig = (orientation: AxisOrientation): AxisConfig => ({
  orientation,
  type: orientation === "x" || orientation === "angle" ? "point" : "linear",
  range: null,
  reverse: false,
});

export const createAxisController = (data: Accessor<unknown[]>) => {
  const [configs, setConfigs] = createSignal(new Map<string, Map<string, AxisConfig>>());
  const [extents, setExtents] = createSignal(new Map<string, Map<string, NumericExtent>>());

  const getAxisConfig = (axisId: string, orientation: AxisOrientation) =>
    configs().get(axisId)?.values().next().value ?? defaultConfig(orientation);

  const registerAxisConfig: ChartContextType["registerAxisConfig"] = (axisId, ownerId, config) =>
    setConfigs((previous) => {
      const next = new Map(previous);
      const owners = new Map(next.get(axisId) ?? []);
      if (isDev) {
        for (const [existingOwnerId, existing] of owners) {
          if (existingOwnerId !== ownerId && !configsEqual(existing, config)) {
            throw new Error(
              `[peculiar-charts]: Axis ID "${axisId}" is registered with incompatible configurations`,
            );
          }
        }
      }
      owners.set(ownerId, config);
      next.set(axisId, owners);
      return next;
    });

  const unregisterAxisConfig: ChartContextType["unregisterAxisConfig"] = (axisId, ownerId) =>
    setConfigs((previous) => {
      const owners = previous.get(axisId);
      if (!owners) return previous;
      const next = new Map(previous);
      const nextOwners = new Map(owners);
      nextOwners.delete(ownerId);
      if (nextOwners.size === 0) next.delete(axisId);
      else next.set(axisId, nextOwners);
      return next;
    });

  const registerExtent: ChartContextType["registerExtent"] = (axisId, seriesId, extent) =>
    setExtents((previous) => {
      const next = new Map(previous);
      const axis = new Map(next.get(axisId) ?? []);
      axis.set(seriesId, extent);
      next.set(axisId, axis);
      return next;
    });

  const unregisterExtent: ChartContextType["unregisterExtent"] = (axisId, seriesId) =>
    setExtents((previous) => {
      const axis = previous.get(axisId);
      if (!axis) return previous;
      const next = new Map(previous);
      const nextAxis = new Map(axis);
      nextAxis.delete(seriesId);
      if (nextAxis.size === 0) next.delete(axisId);
      else next.set(axisId, nextAxis);
      return next;
    });

  const getDomain: ChartContextType["getDomain"] = (axisId, orientation) =>
    resolveAxisDomain({
      config: getAxisConfig(axisId, orientation),
      orientation,
      data: data(),
      extents: extents().get(axisId)?.values(),
    });

  return {
    getAxisConfig,
    registerAxisConfig,
    unregisterAxisConfig,
    registerExtent,
    unregisterExtent,
    getDomain,
  };
};
