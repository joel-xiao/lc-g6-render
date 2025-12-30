import G6 from "@antv/g6";

export function getDagreGridOptions(options) {
    return {
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
    };
}
