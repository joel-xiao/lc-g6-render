const LoopEdge = {
    name: 'loop-edge',
    update(item, cfg, value) {
        if (value && value.name !== 'loop-edge') return;

        const keyShape = item.get('group').find((ele) => ele.get('name') === 'edge-shape');
        keyShape.attr('opacity', 0);

        clearTimeout(cfg.after_update);
        cfg.after_update = setTimeout(() => {
            if (cfg.sourceNode) {
                keyShape.attr('path', getPath(cfg));
            }
            keyShape.attr('opacity', 1);
        }, 100);

        function getPath(cfg) {
            const nodeModel = cfg.sourceNode.getModel();
            const startPoint = {
                x: nodeModel.x - nodeModel.size / 4,
                y: nodeModel.y - nodeModel.size / 2
            };

            const r = 26;
            const t = 60;
            const translate = 15;
            const offset = 8;
            return [
                ['M', startPoint.x + translate - offset, startPoint.y],
                ['C', startPoint.x - r, startPoint.y - t, startPoint.x + translate + offset + r, startPoint.y - t, startPoint.x + translate + offset, startPoint.y],
            ]
        }
    }
};

export default LoopEdge;
