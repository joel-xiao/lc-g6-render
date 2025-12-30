import { getEdgeShape } from './circle-run/items';
import { getCommonEdge } from './circle-run/index';

export function getRegisterEdge(g6_example) {
    const registerEdge = {
        'line-circle-run': {
            register: 'line',
            edge: getCommonEdge('circle-run', g6_example),
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
            }
        },

        'cubic-v-circle-run': {
            register: 'cubic-vertical',
            edge: getCommonEdge('circle-run', g6_example),
        },

        'cubic-h-circle-run': {
            register: 'cubic-horizontal',
            edge: getCommonEdge('circle-run', g6_example),
        },

        'quadratic-circle-run': {
            register: 'quadratic',
            edge: getCommonEdge('circle-run', g6_example),
        },

        'loop-circle-run': {
            register: 'loop',
            edge: getCommonEdge('circle-run', g6_example),
        },
    }

    return registerEdge;
}
