import { getGraphShape } from '../utils';

export default {
    add(type, { group, cfg, style }) {

        const graph_shape = getGraphShape(type, { cfg, style });
        const shape = group.addShape(graph_shape.type, {
            attrs: {
                ...graph_shape.attrs,
                x: 0,
                y: 0,
                stroke: style.stroke,
                fill: style.fill,
            },
            name: 'main-shape',
            'tooltip-event': true,
            'event-name': 'node-main',
            draggable: true,
        });
        return shape;
    },

    update(item, cfg, style) {
        const group = item.get('group');
        const shape = group.find(ele => ele.get('name') === 'main-shape');
        shape.attr({
            stroke: style.stroke,
            fill: style.fill,
        });
    },

    hide(item) {
        const group = item.get('group');
        const shape = group.find(ele => ele.get('name') === 'main-shape');
        shape.attr('opacity', 0);
    },

    show(item) {
        const group = item.get('group');
        const shape = group.find(ele => ele.get('name') === 'main-shape');
        shape.attr('opacity', 1);
    },
}
