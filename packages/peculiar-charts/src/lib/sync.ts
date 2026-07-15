export type SyncMethod = "index" | "value" | ((ticks: any[], data: SyncHandlerParam) => number);

export type SyncHandlerParam = {
  activeTooltipIndex: number | undefined;
  isTooltipActive: boolean;
  activeIndex: number | undefined;
  activeLabel: string | undefined;
  activeDataKey: string | undefined;
  activeCoordinate: { x: number; y: number } | undefined;
};

export type SyncPayload = {
  active: boolean;
  index: number | null;
  /** Category axis used by the source chart interaction. */
  axisId: string;
  coordinate: { x: number; y: number } | undefined;
  label: string | undefined;
  dataKey: string | undefined;
  sourceViewBox:
    | {
        x: number;
        y: number;
        width: number;
        height: number;
      }
    | undefined;
};

type SyncListener = (syncId: string | number, payload: SyncPayload, emitterSymbol: symbol) => void;

class SyncBus {
  private listeners: SyncListener[] = [];

  on(listener: SyncListener) {
    this.listeners.push(listener);
  }

  off(listener: SyncListener) {
    this.listeners = this.listeners.filter((l) => l !== listener);
  }

  emit(syncId: string | number, payload: SyncPayload, emitterSymbol: symbol) {
    for (const listener of this.listeners) {
      listener(syncId, payload, emitterSymbol);
    }
  }
}

export const syncBus = new SyncBus();
