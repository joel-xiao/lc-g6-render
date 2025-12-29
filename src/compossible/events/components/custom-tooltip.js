import { getG6TooltipPos } from '../../util'

export function getCustomTooltipEvent() {
  return {
    click(g6_graph, evt_type, evt, vm) {
      const tooltip_event = evt?.target?.get('tooltip-event');
      const enter_events = ['edge:click'];
      if (enter_events.some(ev => ev === evt_type)) {
        const model = evt.item.getModel();
        if (tooltip_event === false) {
          return;
        }
        vm.setModel(model, evt.item, evt_type);
        vm.closeDefaultTooltip();
      }
    },

    enter(g6_graph, evt_type, evt, vm) {
      const tooltip_event = evt?.target?.get('tooltip-event');
      const enter_events = ['node:mouseenter', 'edge:mouseenter', 'combo:mouseenter'];
      if (enter_events.some(ev => ev === evt_type)) {
        const model = evt.item.getModel();
        if (evt_type === 'combo:mouseenter' && (!model.collapsed || !tooltip_event)) {
          if (!model.collapsed)
            return;
        }

        const item_pos = getG6TooltipPos(g6_graph, evt);
        vm.setModel(model, evt.item, evt_type);
        vm.show(item_pos);
      }
    },

    leave(g6_graph, evt_type, evt, vm) {
      const tooltip_event = evt?.target?.get('tooltip-event');
      const event_name = evt?.target?.get('event-name');
      const leave_events = ['node:mouseleave', 'edge:mouseleave', 'combo:mouseleave', 'combo:click'];
      if (leave_events.some(ev => ev === evt_type)) {
        const model = evt.item.getModel();
        if ((evt_type === 'combo:mouseleave') && (!model.collapsed)) {
          return;
        }

        if (evt_type === 'combo:click' && event_name !== 'combo-collapsed') {
          return;
        }

        vm.hide();
      }
    },

    close(g6_graph, evt_type, evt, vm) {
      const leave_events = ['node:click'];
      if (leave_events.some(ev => ev === evt_type)) {
        vm.close();
      }
    },
  }
}
