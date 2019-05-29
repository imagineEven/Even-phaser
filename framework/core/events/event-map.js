let _symbol = {
  map: Symbol()
};

class EventMap {
  constructor() {
    this[_symbol.map] = new Map();
  }

  get(key) {
    return this.map.get(key);
  }

  set(key, value) {
    return this.map.set(key, value);
  }

  clear() {
    this.map.clear();
  }

  delete(key) {
    this.map.delete(key);
  }

  forEach(callback) {
    this[_symbol.map].forEach(callback);
  }

  get map() {
    return this[_symbol.map];
  }

  get size() {
    return this.map.size;
  }

  has(key) {
    return this.map.has(key);
  }

}

export default EventMap;
