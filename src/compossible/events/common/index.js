import { getDisabledEvent } from './disabled'
import { nodeEvents } from '../node'
import { edgeEvents } from '../edge'
import { comboEvents } from '../combo'
import { componentEvents } from '../components'

export function isEvent(e) {
  // 禁用Event
  const model = e?.item?.getModel();
  const is_disabled_event = e?.target?.get('disabled-event');

  return is_disabled_event || model?.disabled_event;
}

export function getEvent(event) {
  const allEvents = {
    ...nodeEvents,
    ...edgeEvents,
    ...comboEvents,
    'disabled': getDisabledEvent,
  };

  const eventHandler = allEvents[event];
  return eventHandler ? eventHandler() : undefined;
}

export function getComponentEvent(com) {
  return componentEvents[com] ? componentEvents[com]() : undefined;
}

export function onEvent(events, ev_name, e, g6_graph, data) {
  if (e && isEvent(e)) return;
  const result = [];
  events.forEach(ev => {
    const event = getEvent(ev);
    let fn = event?.[ev_name];
    if (fn) {
      const ret = fn(g6_graph, e, event, data);
      result.push(ret);
    } else {
      result.push(undefined);
    }
  });

  return result;
}

export function onComponentEvent(components, evt_type, e, g6_graph, vm, option, cb) {
  if (isEvent(e)) return;

  components.forEach(com => {
    const component = getComponentEvent(com);
    if (component) {
      Object.keys(component).forEach((fn_key) => {
        component[fn_key](g6_graph, evt_type, e, vm, option, cb, component);
      })
    }
  });
}

