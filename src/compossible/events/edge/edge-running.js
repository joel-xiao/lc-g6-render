export function getEdgeRunningEvent() {
  return {
    // 边动画
    setState(g6_graph, e, that, option) {
      const edges = option.edges || [];
      edges.forEach(edge => {
        const edgeItem = g6_graph.find('edge', (item) => item.getModel().target === edge.target && item.getModel().source === edge.source);
        if (edgeItem) {
          const model = edgeItem.getModel();
          model.running = true;
          g6_graph.setItemState(edgeItem, 'running', model.running);
          edgeItem.toFront();
        }
      });
    },

    setCachingState(g6_graph, e, that, option) {
      const g6_example = option.g6_example;
      const caching = g6_example.caching;
      const node = e.item;
      const nodeModel = node.getModel();

      if (caching.getCaching('event.custom-legend.check')) return;

      if (option?.event_type !== 'enter') {
        nodeModel['event-click-edge-running'] = !nodeModel['event-click-edge-running'];
        caching.setCaching('event.edge-running.select', nodeModel['event-click-edge-running']);
      }
    },

    isCachingState(g6_graph, e, that, option) {
      const event_name = e.target.get('event-name');
      return event_name === 'node-collapsed';
    },

    click: (g6_graph, e, that, option) => {
      if (that.isCachingState(g6_graph, e, that, option)) return;
      that.clear(g6_graph, e, that, option);
      that.setCachingState(g6_graph, e, that, option);

      const node = e.item;
      const edges = node.getEdges();
      edges.forEach((edge) => {
        const model = edge.getModel();
        model.running = true;
        g6_graph.setItemState(edge, 'running', model.running)
        edge.toFront();
      });
    },

    enter(g6_graph, e, that, option) {
      const g6_example = option.g6_example;
      const caching = g6_example.caching;

      if (caching.hasCaching('event.edge-running.select')) return;

      const node = e.item;
      const nodeModel = node.getModel();
      if (nodeModel['event-click-edge-running']) return;

      that.click(g6_graph, e, that, { ...option, event_type: 'enter' });
    },

    leave(g6_graph, e, that, option) {
      const g6_example = option.g6_example;
      const caching = g6_example.caching;

      if (caching.hasCaching('event.edge-running.select')) return;

      const node = e.item;
      const nodeModel = node.getModel();
      if (nodeModel['event-click-edge-running']) return;

      that.clear(g6_graph, e, that, option);
    },

    clear(g6_graph, e, that, option) {
      const g6_example = option.g6_example;
      const caching = g6_example.caching;
      caching.setCaching('event.edge-running.select', false);

      const nodes = g6_graph.getNodes();
      nodes.forEach(node => {
        const nodeModel = node.getModel();
        nodeModel['event-click-edge-running'] = false;
      });

      g6_graph.getEdges().forEach((edge) => {
        const model = edge.getModel();
        model.running = false;
        g6_graph.setItemState(edge, 'running', model.running);
      });
    },
  }
}
