import { getShapeAnimate, isNotAnimate, isAnimate } from '../../animations/shape-animate';

// Helper Map
const edgeShapes = {
    'group': {
        setState(item, { name, value }) {
            const model = item.getModel();
            const keyShape = item.get('keyShape');
            const endArrowShape = keyShape.cfg.endArrowShape;
            // event 聚焦事件相关处理
            const name_list = ['active', 'selected'];
            if (name_list.some(key => key === name)) {
                if (value) {
                    keyShape.attr('stroke', model.style[name].stroke);
                    endArrowShape?.attr('fill', model.style[name].endArrow.fill);
                } else {
                    if (!name_list.some(key => model[key])) {
                        keyShape.attr('stroke', model.style.stroke);
                        endArrowShape?.attr('fill', model.style.endArrow.fill);
                    }
                }
            }
        }
    },

    'state-halo': {
        name: 'state-halo',
        add({ group, cfg, style }) {
            group.addShape('path', {
                attrs: {
                    path: [],
                    stroke: style.stroke,
                    lineWidth: 0,
                    opacity: 0,
                },
                zIndex: -1,
                name: this.name,
            });

            group.sort();
        },

        update(item, cfg, value) {
        },

        setState(item, { name, style, value }) {
            const group = item.get('group');
            const keyShape = group.find(ele => ele.get('name') === 'edge-shape');
            const { stroke, lineWidth, endArrow, startArrow } = keyShape.attr();
            const halo = group.find(ele => ele.get('name') === this.name);

            // event 聚焦事件相关处理
            const name_list = ['selected'];
            if (name_list.some(key => key === name)) {
                if (value) {
                    halo.attr('path', keyShape.attr('path'));
                    halo.attr('opacity', 0.2);
                    halo.attr('lineWidth', lineWidth + 8);
                    halo.attr('endArrow', {
                        ...endArrow,
                        opacity: 0,
                    });
                    halo.attr('startArrow', {
                        ...startArrow,
                        opacity: 0,
                    });
                } else {
                    halo.attr('path', keyShape.attr('path'));
                    halo.attr('opacity', 0);
                    halo.attr('lineWidth', 0);
                    halo.attr('endArrow', false);
                    halo.attr('startArrow', false);
                }
            }
        }
    },

    'path-running': {
        name: 'path-running',
        add(type, { group, cfg, style }) {
            if (isNotAnimate()) return;

            const shape = group.get('children')[0];
            const shape_startPoint = shape.getPoint(0);

            group.addShape(type, {
                attrs: {
                    x: shape_startPoint?.x || 0,
                    y: shape_startPoint?.y || 0,
                    opacity: 0,
                    stroke: style.stroke,
                    fill: '#fff',
                    shadowColor: style.stroke,
                    shadowBlur: 10,
                    r: 2,
                },
                name: this.name + type,
            });
        },

        setState(item, { name, style, value }) {
            if (name !== 'running') return;

            const model = item.getModel();
            const keyShape = item.get('keyShape');
            const endArrowShape = keyShape.cfg.endArrowShape;
            const runShape = item.get('group').find(ele => ele.get('name').startsWith(this.name));
            if (value) {
                if (isAnimate()) {
                    getShapeAnimate('from-to').start(runShape, { keyShape });
                    runShape.attr('opacity', 1);
                }

                keyShape.attr('stroke', style.stroke);
                endArrowShape?.attr('fill', style.endArrow.fill);

            } else {
                if (isAnimate()) {
                    getShapeAnimate('from-to').stop(runShape);
                    runShape.attr('opacity', 0);
                }

                keyShape.attr('stroke', model.style.stroke);
                endArrowShape?.attr('fill', model.style.endArrow.fill);
            }
        }
    },

    'loop-edge': {
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
    }
};

export function getEdgeShape(name) {
    return edgeShapes[name];
}
