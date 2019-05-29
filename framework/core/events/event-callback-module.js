import Typeof from '../Typeof';
import EventMap from './event-map';
/**
 * callback
 * 这个方法循环执行本类实例所保存的function,
 * @param callbackContextMap 为Map实例，它的key值为callbackContext,value为事件基本数据类实例
 * @param handler 为本类[EventModule]:Map的实例,它的的Key=handler；
 */
function targetCallback(callbackContextMap, handler) {
  callbackContextMap.forEach(callback, handler);
}

/**
 * callback
 * 这个方法是最底层的回调集合
 * @param event 为本次事件的信息内容
 * @param callbackContext 为回调方法handler中所执行代码所需用到的[this]
 */
function callback(event, callbackContext) {
  let handler=this;
  if (Typeof(handler) !== 'function') {
    return;
  }
  handler.call(callbackContext, ...event.param, event);
}

class Event {
  constructor(e) {
    this.listener = e.listener;
    this.param = e.param;
    this.type = e.type;
    this.callbackContext = e.target;
  }
}

class EventModule extends EventMap {
  constructor(name) {
    super();
    this.name = name;
  }
  
  addCallback(listener, callback, callbackContext, ...param) {
    if (!this.has(callback)) {
      this.set(callback, new Map());
    }
    let e = new Event({
      callbackContext: callbackContext,
      listener: listener,
      param: param,
      type: this.name
    });
    this.get(callback).set(callbackContext, e);
  }

  removeCallback(callback, callbackContext) {
    if (this.has(callback)) {
      if (callbackContext) {
        this.get(callback).delete(callbackContext);
      } else {
        this.delete(callback);
      }
    }
  }

  doCallback() {
    this.forEach(targetCallback);
  }
}

export default EventModule;