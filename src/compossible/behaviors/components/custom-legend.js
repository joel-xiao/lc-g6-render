export default {
    check(g6_graph, evt_type, evt, vm, option) {
        if (evt_type !== 'check') return;
        const items = vm.getItems();
        const is_not_check = items.every(item => !item.check);
        const caching = option.g6_example.caching;
        if (caching.getCaching('event.custom-legend.disabled')) return;
        // caching.setCaching('event.custom-legend.check', !is_not_check);
        const nodes = [...g6_graph.getNodes(), ...g6_graph.getCombos()];
        nodes.forEach(node => {
            if (node.getType() === 'combo' && !node.collapsed) return;

            const node_model = node.getModel();
            const legend = items.find(item => item.filterFn(node_model));
            g6_graph.setItemState(node, 'active_by_legend', {
                value: is_not_check ? true : !!legend?.check,
                event_type: 'check'
            });
        });
    },

    clear(g6_graph, evt_type, evt, vm, option) {
        const caching = option.g6_example.caching;
        // if (caching.getCaching('event.custom-legend.check')) return;
        const events = ['clear'];
        if (!events.some(e => e === evt_type)) return;

        const nodes = [...g6_graph.getNodes(), ...g6_graph.getCombos()];
        nodes.forEach(node => {
            g6_graph.setItemState(node, 'active_by_legend', {
                value: true,
                event_type: 'clear'
            });
        });

        vm.clearChecks();
    },

    disabled(g6_graph, evt_type, evt, vm, option) {
        const caching = option.g6_example.caching;
        if (evt_type !== 'disabled') return;

        caching.setCaching('event.custom-legend.disabled', option.disabled);
        vm.setDisabled(option.disabled);
    }
}
