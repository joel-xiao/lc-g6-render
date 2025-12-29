export function getCustomTextTooltipEvent() {
  return {
    over(g6_graph, evt_type, evt, vm) {
      const tooltip_event = evt?.target?.get('text-tooltip');
      if (!tooltip_event) return;

      const enter_events = ['combo:mouseover'];
      if (enter_events.some(ev => ev === evt_type)) {
        const model = evt.item.getModel();
        if (evt_type === 'combo:mouseover' && model.collapsed) {
          return;
        }
        vm.setModel(model.title);
        vm.show({
          x: evt.clientX + (model.x - evt.x) + evt.target.attrs.x,
          y: evt.clientY + (model.y - evt.y) + evt.target.attrs.y + 6
        });
      }
    },

    out(g6_graph, evt_type, evt, vm) {
      const tooltip_event = evt?.target?.get('text-tooltip');
      if (!tooltip_event) return;

      const enter_events = ['combo:mouseout'];
      if (enter_events.some(ev => ev === evt_type)) {
        const model = evt.item.getModel();
        if (evt_type === 'combo:mouseout' && model.collapsed) {
          return;
        }

        vm.hide();
      }
    },
  }
}
