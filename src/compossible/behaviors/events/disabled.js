export default {
    setState(g6_graph, e, that, option) {
        const g6_example = option.g6_example;
        const caching = g6_example.caching;
        caching.setCaching('event.disabled.select', true);

        const edges = g6_graph.getEdges();
        const nodes = g6_graph.getNodes();
        const option_not_nodes = option.not_nodes || [{}];
        const option_not_edges = option.not_edges || [{}];
        nodes.forEach(node => {
            const is_some = option_not_nodes.some(opt_node => {
                if (typeof opt_node === 'string') {
                    return opt_node === node.getModel().id;
                }
                return opt_node.id === node.getModel().id;
            });

            if (!is_some) {
                g6_graph.setItemState(node, 'disabled', { event_type: 'setState', value: true });
            } else {
                g6_graph.setItemState(node, 'disabled', { event_type: 'setState', value: false });
            }
        });

        edges.forEach(edge => {
            if (!option_not_edges.some(opt_edge => opt_edge.target === edge.getModel().target && opt_edge.source === edge.getModel().source)) {
                g6_graph.setItemState(edge, 'disabled', { event_type: 'setState', value: true });
                edge.toBack();
            }
        });
    },

    setCachingState(g6_graph, e, that, option) {
        if (that.isCachingState(g6_graph, e, that, option)) return;

        const g6_example = option.g6_example;
        const caching = g6_example.caching;
        const node = e.item;
        const nodeModel = node.getModel();

        if (option?.event_type !== 'enter') {
            caching.setCaching('event.disabled.select', true);
        }
    },

    isCachingState(g6_graph, e, that, option) {
        const event_name = e.target.get('event-name');
        return event_name === 'node-collapsed';
    },

    click(g6_graph, e, that, option) {
        if (that.isCachingState(g6_graph, e, that, option)) return;
        that.setCachingState(g6_graph, e, that, option);

        const node = e.item;
        const nodes = [...g6_graph.getNodes(), ...g6_graph.getCombos()];
        nodes.forEach(node => {
            if (node.getType() === 'combo' && !node.collapsed) return;
            g6_graph.setItemState(node, 'disabled', { event_type: option?.event_type || 'click', value: true });
        });

        const edges = g6_graph.getEdges();
        edges.forEach(edge => {
            g6_graph.setItemState(edge, 'disabled', { event_type: option?.event_type || 'click', value: true });
        });

        g6_graph.setItemState(e.item, 'disabled', { event_type: option?.event_type || 'click', value: false });
        const out_edges = node.getOutEdges();
        out_edges.forEach(edge => {
            const targetNode = edge.getTarget();
            if (targetNode) {
                g6_graph.setItemState(targetNode, 'disabled', { event_type: option?.event_type || 'click', value: false });
                disabledCombo(targetNode);
            }
            g6_graph.setItemState(edge, 'disabled', { event_type: option?.event_type || 'click', value: false });
        });

        const in_edges = node.getInEdges();
        in_edges.forEach(edge => {
            const sourceNode = edge.getSource();
            if (sourceNode) {
                g6_graph.setItemState(sourceNode, 'disabled', { event_type: option?.event_type || 'click', value: false });
                disabledCombo(sourceNode);
            }
            g6_graph.setItemState(edge, 'disabled', { event_type: option?.event_type || 'click', value: false });
        });

        function disabledCombo(node) {
            const nodeModel = node.getModel();
            if (node.getType() === 'combo') {
                const nodes = node.getNodes();
                for (const node of nodes) {
                    g6_graph.setItemState(node, 'disabled', { event_type: option?.event_type || 'click', value: false });
                    const in_edges = node.getInEdges();
                    for (const edge of in_edges) {
                        g6_graph.setItemState(edge, 'disabled', { event_type: option?.event_type || 'click', value: false });
                    }

                    const out_edges = node.getOutEdges();
                    for (const edge of out_edges) {
                        g6_graph.setItemState(edge, 'disabled', { event_type: option?.event_type || 'click', value: false });
                    }
                }
            }
        }
    },

    enter(g6_graph, e, that, option) {
        const g6_example = option.g6_example;
        const caching = g6_example.caching;
        if (caching.hasCaching('event.disabled.select')) return;

        const node = e.item;
        const nodeModel = node.getModel();
        that.click(g6_graph, e, that, { ...option, event_type: 'enter' });
    },

    leave(g6_graph, e, that, option) {
        const g6_example = option.g6_example;
        const caching = g6_example.caching;

        if (caching.hasCaching('event.disabled.select')) return;

        const node = e.item;
        const nodeModel = node.getModel();

        that.clear(g6_graph, e, that, option);
    },

    clear(g6_graph, e, that, option) {
        const g6_example = option.g6_example;
        const caching = g6_example.caching;
        caching.setCaching('event.disabled.select', false);

        const nodes = [...g6_graph.getNodes(), ...g6_graph.getCombos()];
        nodes.forEach(node => {
            const nodeModel = node.getModel();
            g6_graph.setItemState(node, 'disabled', { event_type: 'clear', value: false });
        });

        const edges = g6_graph.getEdges();
        edges.forEach(edge => {
            g6_graph.setItemState(edge, 'disabled', { event_type: 'clear', value: false });
        });
    }
}
