import EventListener from './event-listener';

let _symbol = {
  listener: Symbol(),
  target: Symbol()
};

function remove(eventDispatcher, listener, event, callback, target) {
  if (eventDispatcher.listener.has(listener)) {
    if (!event) {
      eventDispatcher.listener.delete(listener);
    } else {
      eventDispatcher.listener.get(listener).removeEvent(event, callback, target);
    }
  }
}

function add(eventDispatcher, listener, event, callback, target, ...param) {
  if (!eventDispatcher.listener.has(listener)) {
    eventDispatcher.listener.set(listener, new EventListener(listener));
  }
  eventDispatcher.listener.get(listener).addEvent(event, callback, target || null, ...param);
}

class EventDispatcher {
  constructor() {
    EventDispatcher.listener.clear();
    this[_symbol.listener] = new Map();
  }

  static addListener(listener, event, callback, target, ...param) {
    add(EventDispatcher, listener, event, callback, target, ...param);
  }

  addListener(listener, event, callback, target, ...param) {
    add(this, listener, event, callback, target, ...param);
  }

  static removeListener(listener, event, callback, target) {
    remove(EventDispatcher, listener, event, callback, target);
  }

  removeListener(listener, event, callback, target) {
    remove(this, listener, event, callback, target);
  }

  static dispatchEvent(listener, event) {
    if (EventDispatcher.listener.has(listener)) {
      EventDispatcher.listener.get(listener).doEvent(event);
    }
  }

  dispatchEvent(listener, event) {
    if (this.listener.has(listener)) {
      this.listener.get(listener).doEvent(event);
    }
  }

  static removeAllListener() {
    EventDispatcher.listener.clear();
  }

  removeAllListener() {
    this.listener.clear();
  }

  static get listener() {
    return EventDispatcher[_symbol.listener];
  }

  get listener() {
    return this[_symbol.listener];
  }
}

EventDispatcher[_symbol.listener] = new Map();
export default EventDispatcher;
