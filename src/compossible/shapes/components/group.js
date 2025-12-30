export default {
    disabled(g6_example, item, name, value) {

        const model = item.getModel();
        const group = item.get('group');

        const state_names = ['disabled', 'active_by_legend'];
        if (!state_names.some(item_name => item_name === name)) return;

        const event_type = value.event_type;
        value = value.value;

        model[name] = value;

        const hide_opacity = model.id.startsWith('edge-') ? 0.1 : 0.2;

        if (name === 'disabled') {
            if (model[name]) {
                group.attr('opacity', hide_opacity);
                model['disabled_event'] = true;

            } else {
                group.attr('opacity', 1);
                model['disabled_event'] = false;
            }

            if (event_type === 'leave' || event_type === 'clear') {
                if (!model[name] && model['active_by_legend'] !== false) {
                    group.attr('opacity', 1);
                    model['disabled_event'] = false;
                } else {
                    model['disabled_event'] = true;
                    group.attr('opacity', hide_opacity);
                }
            }
        }

        if (name === 'active_by_legend') {
            if (model[name]) {
                group.attr('opacity', 1);
                model['disabled_event'] = false;

            } else {
                model['disabled_event'] = true;
                group.attr('opacity', hide_opacity);
            }
        }

        //按事件权重更改禁用状态
        const caching = g6_example.caching;
        const disabled_status = caching.getCaching('event.disabled.select');

        if (disabled_status) {
            if (!model['disabled']) {
                model['disabled_event'] = false;
            }
        }
    }
}
