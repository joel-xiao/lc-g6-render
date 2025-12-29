export function getCustomLoadingEvent() {
  return {
    click(g6_graph, evt_type, evt, vm, option, cb) {
      const events = ['node:click'];
      if (!events.some(ev => ev === evt_type)) return;
      const model = evt.item.getModel();

      const centerNodes = option.g6_example.vmOption.centerNodes || [];
      if (centerNodes.some(nodeId => nodeId === model.id)) return; // 中心节点直接 return;

      if (model.disabled_collapse) return;
      if (evt?.target?.get('event-name') === 'node-collapsed') {
        if (model[evt.target.get('disabled-name')]) return;
        if (model[evt.target.get('collapsed-name')]) {
          const model = evt.item.getModel();
          const target = evt.target;
          const edgeType = target.get('node-edge-type');
          const targetX = target.attr('x') || -8;
          const targetY = target.attr('y') || (edgeType === 'in-edges' ? -43 : 27);
          vm.show({
            x: evt.clientX + (model.x - evt.x) + targetX,
            y: evt.clientY + (model.y - evt.y) + targetY,
          });
          cb?.();
        }
      }
    },

    hide(g6_graph, evt_type, evt, vm, option, cb) {
      if (evt_type !== 'hide') return;
      vm.hide();

      if (option.text) {
        vm.showText(option, cb);
      } else {
        cb?.();
      }
    },
  }
}
