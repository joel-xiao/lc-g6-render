import G6 from "@antv/g6";

export function getDagreOptions(options) {
    return {
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
    };
}
