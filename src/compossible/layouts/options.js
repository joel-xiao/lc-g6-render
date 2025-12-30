import G6 from "@antv/g6";

export function getLayout(layout, options) {
    const data = {
        'dagre': {
            type: 'comboCombined',
            outerLayout: new G6.Layout['dagre']({
                rankdir: 'TB',
                nodesep: 70,
                ranksep: 80,
                sortByCombo: true,
                ...options?.outerLayout,
            }),

            innerLayout: new G6.Layout['dagre']({
                rankdir: 'TB',
                nodesep: 70,
                ranksep: 50,
                ...options?.innerLayout,
            }),
        },

        'dagre-grid': {
            type: 'comboCombined',
            begin: [0, 0],
            outerLayout: new G6.Layout['dagre']({
                rankdir: 'LR',
                nodesep: 90,
                ranksep: 90,
                sortByCombo: true,
                ...options?.outerLayout,
            }),

            innerLayout: new G6.Layout['grid']({
                preventOverlap: true,
                condense: true,
                nodeSize: 70 * 2.3,
                sortBy: 'comboId',
                // ...options?.innerLayout,
            }),
        },

        'grid': {
            type: 'grid',
            // begin: [20, 20],
        },

        'random': {
            type: 'random',
        },

        'dagre-tbt': {
            type: 'dagre-tbt',
            nodesep: 70,
            ranksep: 80,
        },

        'dagre-tgb': {
            type: 'dagre-tgb',
            nodesep: 70,
            ranksep: 80,
        }
    };
    return data[layout] || data['dagre'];
}
