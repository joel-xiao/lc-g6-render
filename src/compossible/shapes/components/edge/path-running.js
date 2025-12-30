import { getAnimation, isNotAnimate, isAnimate } from '../../animations/index';

const PathRunning = {
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
                getAnimation('from-to').start(runShape, { keyShape });
                runShape.attr('opacity', 1);
            }

            keyShape.attr('stroke', style.stroke);
            endArrowShape?.attr('fill', style.endArrow.fill);

        } else {
            if (isAnimate()) {
                getAnimation('from-to').stop(runShape);
                runShape.attr('opacity', 0);
            }

            keyShape.attr('stroke', model.style.stroke);
            endArrowShape?.attr('fill', model.style.endArrow.fill);
        }
    }
};

export default PathRunning;
