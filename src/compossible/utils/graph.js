export function getG6TooltipPos(g6_graph, e) {
    const model = e.item.getModel();
    const tooltip_name = model.id.startsWith('edge') ? 'edge' : 'node';
    if (tooltip_name === 'node') {
        return {
            x: e.clientX + (model.x - e.x) + model.size / 1.5,
            y: e.clientY + (model.y - e.y) - 10,
        }
    } else {
        return {
            x: e.clientX + 10,
            y: e.clientY + 10,
        }
    }
}
