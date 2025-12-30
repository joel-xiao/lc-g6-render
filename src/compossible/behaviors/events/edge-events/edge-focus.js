export default {
    // 边聚焦
    enter: (g6_graph, e, that) => {
        that.triggerEdgeEvent(g6_graph, e, 'enter');
    },

    leave(g6_graph, e, that) {
        that.triggerEdgeEvent(g6_graph, e, 'leave');
    },

    clear(g6_graph) {
        g6_graph.getEdges().forEach((edge) => {
            const model = edge.getModel();
            model.selected = false;
            g6_graph.setItemState(edge, 'selected', model.selected);
        });
    },

    triggerEdgeEvent(g6_graph, e, type) {
        const selected = type === 'enter';
        const { item } = e;
        const model = item.getModel();

        // Handle Node Event
        if (item.getType() === 'node') {
            const edges = item.getEdges();
            edges.forEach(edge => {
                const edgeModel = edge.getModel();
                edgeModel.selected = selected;
                g6_graph.setItemState(edge, 'selected', selected);
                edge.toFront();

                // Highlight neighbor nodes
                const sourceNode = edge.getSource();
                const targetNode = edge.getTarget();
                if (sourceNode !== item) g6_graph.setItemState(sourceNode, 'selected', selected);
                if (targetNode !== item) g6_graph.setItemState(targetNode, 'selected', selected);
            });
            return;
        }

        // Handle Edge Event
        const sourceItem = item.getSource();
        const source_in_edges = sourceItem.getInEdges();
        model.selected = selected;
        item.toFront();
        g6_graph.setItemState(item, 'selected', model.selected);
        source_in_edges.forEach(edgeItem => {
            const edge_model = edgeItem.getModel();
            edge_model.selected = selected;
            if (edge_model.source === model.target && edge_model.target === model.source) {
                g6_graph.setItemState(edgeItem, 'selected', edge_model.selected);
            }
        })
    }
}
