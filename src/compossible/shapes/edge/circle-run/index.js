import { getComponent } from '../../items/index';
import { getEdgeShape } from './items';
import defaults from './options';

export { getEdgeShape, defaults };

export function getCommonEdge(edge_type, g6_example) {
    const commonEdge = {
        'circle-run': {
            afterDraw(cfg, group) {
                const style = cfg.style?.running;
                getEdgeShape('state-halo').add({ cfg, group, style });
                getEdgeShape('path-running').add('circle', { cfg, group, style });
            },

            setState(name, value, item) {
                const model = item.getModel();

                // 置灰 or 非置灰 (Using general component group)
                getComponent('group').disabled(g6_example, item, name, value);

                const style = model.style?.running;
                getEdgeShape('state-halo').setState(item, { style, name, value });
                getEdgeShape('path-running').setState(item, { style, name, value });
                if (model.running) return;

                // Edge specific group
                getEdgeShape('group').setState(item, { style, name, value });
            },
        }
    }

    return commonEdge[edge_type];
}

export function getRegister(g6_example) {
    return {
        'line-circle-run': {
            register: 'line',
            edge: getCommonEdge('circle-run', g6_example),
            options: defaults,
        },

        'cubic-circle-run': {
            register: 'cubic',
            edge: {
                ...getCommonEdge('circle-run', g6_example),
                getPath(points) {
                    const startPoint = points[0];
                    const endPoint = points[points.length - 1];

                    return [
                        ['M', startPoint.x, startPoint.y],
                        ['C', points[1].x, points[1].y, points[2].x, points[2].y, endPoint.x, endPoint.y],
                    ]
                },
            },
            options: defaults,
        },

        'cubic-v-circle-run': {
            register: 'cubic-vertical',
            edge: getCommonEdge('circle-run', g6_example),
            options: defaults,
        },

        'cubic-h-circle-run': {
            register: 'cubic-horizontal',
            edge: getCommonEdge('circle-run', g6_example),
            options: defaults,
        },

        'quadratic-circle-run': {
            register: 'quadratic',
            edge: getCommonEdge('circle-run', g6_example),
            options: defaults,
        },

        'loop-circle-run': {
            register: 'loop',
            edge: getCommonEdge('circle-run', g6_example),
            options: defaults,
        },
    }
}
