import type { StackEntry, StackOffset } from "@src/components/context";

export type Stack = Map<string, StackEntry>;

export const resolveStackOffset = (offset: StackOffset | undefined): StackOffset =>
  offset ?? "none";

export const stackKeys = (stack: Stack): string[] => [...stack.keys()];

const stackColumnValue = (stack: Stack, key: string, index: number): number =>
  Number.isFinite(stack.get(key)?.values[index]) ? stack.get(key)!.values[index]! : 0;

const stackColumnTotal = (stack: Stack, keys: string[], index: number): number => {
  let total = 0;
  for (const key of keys) total += stackColumnValue(stack, key, index);
  return total;
};

const previousCumulative = (
  stack: Stack,
  keys: string[],
  index: number,
  currentIndex: number,
): number => {
  let total = 0;
  for (let i = 0; i < currentIndex; i++) total += stackColumnValue(stack, keys[i]!, index);
  return total;
};

const previousSignedCumulative = (
  stack: Stack,
  keys: string[],
  index: number,
  currentIndex: number,
  value: number,
): number => {
  let total = 0;
  if (value >= 0) {
    for (let i = 0; i < currentIndex; i++) {
      const v = stackColumnValue(stack, keys[i]!, index);
      if (v >= 0) total += v;
    }
    return total;
  }

  for (let i = 0; i < currentIndex; i++) {
    const v = stackColumnValue(stack, keys[i]!, index);
    if (v < 0) total += v;
  }
  return total;
};

export const stackBaseValue = (props: {
  stack: Stack;
  keys: string[];
  dataKey: string | undefined;
  index: number;
  value: number;
  offset: StackOffset | undefined;
}): number => {
  const currentIndex = props.keys.indexOf(props.dataKey ?? "");
  if (currentIndex <= 0 && resolveStackOffset(props.offset) !== "silhouette") return 0;

  const offset = resolveStackOffset(props.offset);
  if (offset === "sign") {
    return previousSignedCumulative(
      props.stack,
      props.keys,
      props.index,
      currentIndex,
      props.value,
    );
  }

  const cumulative = previousCumulative(props.stack, props.keys, props.index, currentIndex);

  if (offset === "expand") {
    const total = stackColumnTotal(props.stack, props.keys, props.index);
    return total === 0 ? 0 : cumulative / total;
  }

  if (offset === "silhouette") {
    const total = stackColumnTotal(props.stack, props.keys, props.index);
    return -total / 2 + cumulative;
  }

  return cumulative;
};

export const stackTopValue = (props: {
  stack: Stack;
  keys: string[];
  dataKey: string | undefined;
  index: number;
  value: number;
  offset: StackOffset | undefined;
}): number => {
  const offset = resolveStackOffset(props.offset);
  if (offset === "expand") {
    const total = stackColumnTotal(props.stack, props.keys, props.index);
    if (total === 0) return 0;
    return (
      stackBaseValue({
        ...props,
        offset,
      }) +
      props.value / total
    );
  }

  return (
    stackBaseValue({
      ...props,
      offset,
    }) + props.value
  );
};

export const stackExtent = (
  stack: Stack,
  offset: StackOffset | undefined,
): { min: number; max: number } => {
  const keys = stackKeys(stack);
  const length = Math.max(0, ...keys.map((key) => stack.get(key)?.values.length ?? 0));
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;

  for (let index = 0; index < length; index++) {
    for (const key of keys) {
      const value = stackColumnValue(stack, key, index);
      const base = stackBaseValue({ stack, keys, dataKey: key, index, value, offset });
      const top = stackTopValue({ stack, keys, dataKey: key, index, value, offset });
      min = Math.min(min, base, top);
      max = Math.max(max, base, top);
    }
  }

  if (!Number.isFinite(min) || !Number.isFinite(max)) return { min: 0, max: 0 };
  return { min, max };
};
