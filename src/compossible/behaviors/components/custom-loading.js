export default {
    // 显示 loading - 由 expand-link-event 主动调用
    show(g6_graph, evt_type, evt, vm, option, cb) {
        if (evt_type !== 'show') return;
        
        const model = evt?.item?.getModel();
        if (!model) return;
        
        const target = evt.target;
        const edgeType = target?.get('node-edge-type');
        const targetX = target?.attr('x') || -8;
        const targetY = target?.attr('y') || (edgeType === 'in-edges' ? -43 : 27);
        
        vm.show({
            x: evt.clientX + (model.x - evt.x) + targetX,
            y: evt.clientY + (model.y - evt.y) + targetY,
        });
        cb?.();
    },

    // 隐藏 loading
    hide(g6_graph, evt_type, evt, vm, option, cb) {
        if (evt_type !== 'hide') return;
        vm.hide();

        if (option?.text) {
            vm.showText(option, cb);
        } else {
            cb?.();
        }
    },
}
