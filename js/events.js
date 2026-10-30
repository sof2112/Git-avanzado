// Minimal pub/sub event bus. It keeps the three modules (handpose, game,
// ui) decoupled: a module emits events and the others subscribe to them,
// instead of importing and calling each other directly.
export const EVENTS = {
  HANDS_UPDATED: "hands-updated",
};

export class EventBus {
  constructor() {
    this.listeners = new Map();
  }

  // Registers a handler for an event. Returns an unsubscribe function.
  on(event, handler) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(handler);
    return () => this.off(event, handler);
  }

  off(event, handler) {
    this.listeners.get(event)?.delete(handler);
  }

  // Calls every handler registered for `event` with `payload`.
  emit(event, payload) {
    this.listeners.get(event)?.forEach((handler) => handler(payload));
  }
}
