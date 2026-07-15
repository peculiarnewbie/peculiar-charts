import type { ChartContextType, SeriesMeta } from "@src/components/context";
import { paletteColor } from "@src/lib/palette";
import { createMemo, createSignal } from "solid-js";

type RegisteredSeries = Omit<SeriesMeta, "id" | "color"> & { color?: string };

export const createSeriesController = () => {
  const [registered, setRegistered] = createSignal(new Map<string, RegisteredSeries>());
  const [hidden, setHidden] = createSignal(new Set<string>());
  let nextOrder = 0;

  const seriesMeta = createMemo<SeriesMeta[]>(() =>
    [...registered()]
      .map(([id, meta]) => ({
        ...meta,
        id,
        color: meta.color ?? paletteColor(meta.order),
      }))
      .sort((left, right) => left.order - right.order),
  );

  const registerSeriesMeta: ChartContextType["registerSeriesMeta"] = (id, meta) =>
    setRegistered((previous) => {
      const existing = previous.get(id);
      return new Map(previous).set(id, {
        ...meta,
        order: existing?.order ?? nextOrder++,
      });
    });

  const unregisterSeriesMeta: ChartContextType["unregisterSeriesMeta"] = (id) => {
    setRegistered((previous) => {
      const next = new Map(previous);
      next.delete(id);
      return next;
    });
    setHidden((previous) => {
      if (!previous.has(id)) return previous;
      const next = new Set(previous);
      next.delete(id);
      return next;
    });
  };

  const isSeriesVisible = (id: string) => !hidden().has(id);
  const toggleSeries = (id: string) =>
    setHidden((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return {
    seriesMeta,
    registerSeriesMeta,
    unregisterSeriesMeta,
    isSeriesVisible,
    toggleSeries,
  };
};
