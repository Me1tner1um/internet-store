import type { TraceEvent } from '../types';

type TraceListener = (event: TraceEvent) => void;

class TraceBus {
  private listeners: TraceListener[] = [];
  private history: TraceEvent[] = [];

  subscribe(listener: TraceListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  emit(event: TraceEvent) {
    this.history = [event, ...this.history.slice(0, 49)]; // keep last 50
    this.listeners.forEach((l) => l(event));
  }

  getHistory(): TraceEvent[] {
    return this.history;
  }

  clear() {
    this.history = [];
  }
}

export const traceBus = new TraceBus();

