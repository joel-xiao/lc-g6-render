export default {
    click(g6_graph, e, that, option) {
        // 允许点击节点的任何部分触发光晕，除非明确禁用
        if (e.target.get('disabled-active')) return;
        
        const g6_example = option.g6_example;
        const caching = g6_example.caching;
        // if (caching.hasCaching('event.node-active.item')) return;
        that.clear(g6_graph, e, that, option);

        const node = e.item;
        const model = e.item.getModel();
        model.active = true;
        g6_graph.setItemState(node, 'node-active', model.active);
        caching.setCaching('event.node-active.item', node)
    },

    cancelStatus(g6_graph, e, that, option) {
        const node = e.item;
        const model = e.item.getModel();
        model.active = false;
        g6_graph.setItemState(node, 'node-active', model.active);
    },

    clear(g6_graph, e, that, option) {
        const g6_example = option.g6_example;
        const caching = g6_example.caching;
        if (caching.hasCaching('event.node-active.item')) {
            const node = caching.getCaching('event.node-active.item');
            that.cancelStatus(g6_graph, { item: node }, that, option);
            caching.delCaching('event.node-active.item');

        } else {
            g6_graph?.getNodes().forEach((node) => {
                const model = node.getModel();
                model.active = false;
                g6_graph.setItemState(node, 'node-active', model.active);
            });
        }

    },

    load(g6_graph, e, that, data) {
        if (!data.ids) return;
        try {
            data.ids.forEach(id => {
                const node = g6_graph.findById(id);
                if (node) {
                    const model = node.getModel();
                    model.active = true;
                    g6_graph.setItemState(node, 'node-active', model.active);
                }
            });
        } catch (e) { }
    },
}
