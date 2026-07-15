import type { BarRegistry, ChartContextType, ScopedStack } from "@src/components/context";
import { stackScopeKey } from "@src/lib/stacking";
import { createSignal } from "solid-js";
import { isDev } from "solid-js/web";

export const createStackBarController = () => {
  const [stacks, setStacks] = createSignal(new Map<string, ScopedStack>());
  const [bars, setBars] = createSignal<BarRegistry>(new Map());

  const registerStack: ChartContextType["registerStack"] = (scope, entry) =>
    setStacks((previous) => {
      const key = stackScopeKey(scope);
      const current = previous.get(key);
      if (isDev && current) {
        for (const existing of current.entries.values()) {
          if (
            existing.seriesId !== entry.seriesId &&
            existing.values.length !== entry.values.length
          ) {
            throw new Error(
              `[peculiar-charts]: Stack "${scope.stackId}" members must have compatible data lengths`,
            );
          }
        }
      }
      const entries = new Map(current?.entries ?? []);
      entries.set(entry.seriesId, entry);
      return new Map(previous).set(key, { scope, entries });
    });

  const unregisterStack: ChartContextType["unregisterStack"] = (scope, seriesId) =>
    setStacks((previous) => {
      const key = stackScopeKey(scope);
      const current = previous.get(key);
      if (!current) return previous;
      const next = new Map(previous);
      const entries = new Map(current.entries);
      entries.delete(seriesId);
      if (entries.size === 0) next.delete(key);
      else next.set(key, { scope: current.scope, entries });
      return next;
    });

  const registerBar: ChartContextType["registerBar"] = (scopeKey, slotKey, seriesId) =>
    setBars((previous) => {
      const next = new Map(previous);
      const slots = new Map(next.get(scopeKey) ?? []);
      const owners = new Set(slots.get(slotKey) ?? []);
      owners.add(seriesId);
      slots.set(slotKey, owners);
      next.set(scopeKey, slots);
      return next;
    });

  const unregisterBar: ChartContextType["unregisterBar"] = (scopeKey, slotKey, seriesId) =>
    setBars((previous) => {
      const currentSlots = previous.get(scopeKey);
      const currentOwners = currentSlots?.get(slotKey);
      if (!currentSlots || !currentOwners) return previous;
      const next = new Map(previous);
      const slots = new Map(currentSlots);
      const owners = new Set(currentOwners);
      owners.delete(seriesId);
      if (owners.size === 0) slots.delete(slotKey);
      else slots.set(slotKey, owners);
      if (slots.size === 0) next.delete(scopeKey);
      else next.set(scopeKey, slots);
      return next;
    });

  return { stacks, registerStack, unregisterStack, bars, registerBar, unregisterBar };
};
