import NodeCollapsed from './node-collapsed';
import NodeActive from './node-active';
import EdgeRunning from './edge-running';
import EdgeFocus from './edge-focus';
import ComboCollapsed from './combo-collapsed';
import LoopEdge from './loop-edge';
import Disabled from './disabled';

const events = {
    'node-collapsed': NodeCollapsed,
    'node-active': NodeActive,
    'edge-running': EdgeRunning,
    'edge-focus': EdgeFocus,
    'combo-collapsed': ComboCollapsed,
    'loop-edge': LoopEdge,
    'disabled': Disabled,
};

export function getEvent(name) {
    return events[name];
}

export function isEvent(e) {
    // 禁用Event
    const model = e?.item?.getModel();
    const is_disabled_event = e?.target?.get('disabled-event');

    return is_disabled_event || model?.disabled_event;
}

export function onEvent(event_names, ev_name, e, g6_graph, data) {
    if (e && isEvent(e)) return;
    const result = [];
    event_names.forEach(ev => {
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
