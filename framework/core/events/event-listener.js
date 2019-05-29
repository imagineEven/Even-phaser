import EventModule from './event-callback-module';
import EventMap from './event-map';

class EventListener extends EventMap {
  constructor(name) {

    super();
    this.name = name;
  }

  addEvent(event, callback, target, ...param) {
    if (!this.has(event)) {
      this.set(event, new EventModule(event));
    }
    this.get(event).addCallback(this.name, callback, target, ...param);
  }

  removeEvent(event, callback, target) {
    if (this.has(event)) {
      if (callback) {
        this.get(event).removeCallback(callback, target);
      } else {
        this.delete(event);
      }
    }
  }

  doEvent(event) {
    if (this.has(event)) {
      this.get(event).doCallback();
    }
  }
}

export default EventListener;

