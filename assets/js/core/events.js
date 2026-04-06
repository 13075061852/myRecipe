// ===== Event Bus =====
function createEventBus() {
  const handlers = new Map();

  function on(eventName, handler) {
    if (!handlers.has(eventName)) handlers.set(eventName, new Set());
    handlers.get(eventName).add(handler);
    return () => off(eventName, handler);
  }

  function off(eventName, handler) {
    const set = handlers.get(eventName);
    if (!set) return;
    set.delete(handler);
    if (!set.size) handlers.delete(eventName);
  }

  function emit(eventName, payload) {
    const set = handlers.get(eventName);
    if (!set) return;
    set.forEach(fn => {
      try { fn(payload); } catch (err) { console.error('[EventBus]', eventName, err); }
    });
  }

  return { on, off, emit };
}

const appEvents = createEventBus();

