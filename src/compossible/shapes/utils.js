/**
 * Base shape attributes helper
 */
export function getGraphShape(type, { cfg, style }) {
    let attrs;
    if (type === 'circle') {
        attrs = {
            r: cfg.size / 2,
        };
    } else if (type === 'hexagonal-polygon') {
        type = 'polygon';
        const size_r = (cfg.size + 12) / 4;
        attrs = {
            points: [
                [-1 * size_r, Math.sqrt(3) * size_r],
                [1 * size_r, Math.sqrt(3) * size_r],
                [2 * size_r, 0 * size_r],
                [1 * size_r, -1 * Math.sqrt(3) * size_r],
                [-1 * size_r, -1 * Math.sqrt(3) * size_r],
                [-2 * size_r, 0 * size_r],
                [-1 * size_r, Math.sqrt(3) * size_r],
            ]
        }
    } else if (type === 'ellipse') {
        attrs = {
            rx: Array.isArray(cfg.size) ? cfg.size[0] / 2 : cfg.size / 2,
            ry: Array.isArray(cfg.size) ? cfg.size[1] / 2 : cfg.size / 2,
        };
    } else if (type === 'path') {
        attrs = {
            path: cfg.path || style.path,
        };
    } else {
        // Default fallback to circle attributes to prevent crash
        attrs = {
            r: (Array.isArray(cfg.size) ? cfg.size[0] : cfg.size) / 2 || 15,
        };
    }

    const { lineWidth } = style || {};
    attrs.lineWidth = lineWidth || cfg.style.lineWidth || 1;

    return {
        attrs,
        type
    };
}

/**
 * Anchor points helper
 */
export const getAnchorPoints = function (name) {
    const mode = {
        'drag-canvas': {
            getNodeAnchorPoints: (cfg, g6_graph) => {
                return [
                    [0.5, 0], // top
                    [1, 0.5], // right
                    [0.5, 1], // bottom
                    [0, 0.5], // left
                ];
            },
            getEdgeAnchorPoints: (options) => {
                return options;
            }
        },
        'center': {
            getNodeAnchorPoints: (cfg, g6_graph) => {
                return [
                    [0.5, 0.5], // center
                ];
            },
            // ...
            getEdgeAnchorPoints: (options) => {
                return options;
            }
        }
    }
    return mode[name] || mode['drag-canvas'];
};
