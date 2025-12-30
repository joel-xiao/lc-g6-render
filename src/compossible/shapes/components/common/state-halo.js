import { getGraphShape } from '../utils';
import { getShapeAnimate, isNotAnimate } from '../../animations/shape-animate';

export default {
    name: 'state-halo',
    getCfg() {
        return {
            opacity: ''
            // opacity: '20'
        }
    },

    add(type, { group, cfg, style, name = 'main-box' }) {
        name = name + '-' + this.name;
        const haloWidth = 0;

        const graph_shape = getGraphShape(type, { cfg, style });
        const that_cfg = this.getCfg();
        const attrs = {
            ...graph_shape.attrs,
            x: 0,
            y: 0,
            stroke: style.stroke + that_cfg.opacity,
            opacity: 0,
        };

        for (let i = 0; i < 3; i++) {
            group.addShape(graph_shape.type, {
                attrs: {
                    ...attrs,
                    lineWidth: attrs.lineWidth + haloWidth,
                },
                'tooltip-event': true,
                'index': i,
                'shape-size': attrs.lineWidth + haloWidth,
                name: name + '-' + i,
            });
        }
    },

    update(item, cfg, style) {
        const that_cfg = this.getCfg();
        const shape_name = this.name;
        const group = item.get('group');
        const group_children = group.get('children');
        group_children.forEach(shape => {
            if (shape.get('name')?.includes(shape_name)) {
                shape.attr('stroke', style.stroke + that_cfg.opacity);
            }
        });
    },

    setState(item, { name, value, style }) {
        const shape_name = this.name;
        const group = item.get('group');
        const group_children = group.get('children');
        let sum = 0;
        group_children.forEach(shape => {
            if (shape.get('name')?.includes(shape_name)) {
                if (shape.attr('show') === false) return;

                if (isNotAnimate()) {
                    shape.attr('opacity', value ? 0.3 : 0);
                    shape.attr('lineWidth', value ? shape.get('shape-size') + (8 * sum) : 0);
                } else {
                    shape.attr('opacity', value ? 1 : 0);

                    if (value) {
                        getShapeAnimate('ripple').start(shape, item);
                    } else {
                        getShapeAnimate('ripple').stop(shape, item);
                    }
                }


                sum++;
            }
        });
    },

    hide(item) {
        const shape_name = this.name;
        const group = item.get('group');
        const group_children = group.get('children');

        group_children.forEach(shape => {
            if (shape.get('name')?.includes(shape_name)) {
                getShapeAnimate('ripple').stop(shape, item);
                shape.attr('opacity', 0);
                shape.attr('show', false);
            }
        });
    },

    show(item) {
        const shape_name = this.name;
        const group = item.get('group');
        const group_children = group.get('children');

        group_children.forEach(shape => {
            if (shape.get('name')?.includes(shape_name)) {
                shape.attr('opacity', 1);
                shape.attr('show', true);
                getShapeAnimate('ripple').start(shape, item);
            }
        });
    },
}
