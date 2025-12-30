import NormalEvent from './normal-event';

export function getCustomBehavior(type, event_type) {
    const behavior = {
        'normal-event': NormalEvent,
    }

    const custom_behavior = behavior[type]
    const fn_name = custom_behavior.getEvent(event_type);
    return custom_behavior[fn_name];
}
