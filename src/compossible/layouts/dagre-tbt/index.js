import { layoutEdges, layoutCombo, layoutNodes, layoutNodesOffset } from './methods';

export const registerLayout = {
    'dagre-tbt': {
        layout: {
            getDefaultCfg() {
                return {
                    nodesep: 70,
                    ranksep: 70,
                };
            },
            init(data) {
                const self = this;
                self.combos = data.combos;
                self.nodes = data.nodes;
                self.edges = data.edges;
            },

            layout(data) {
                const self = this;
                self.init(data);
                self.execute();
            },

            execute() {
                try {
                    var self = this;
                    var nodes = self.nodes.sort((a, b) => a.node_depth - b.node_depth);
                    const sep = (nodes[0]?.size || 70) + self.nodesep + self.ranksep;

                    if (self.combos.length) {
                        for (const combo of self.combos) {
                            layoutCombo(nodes, combo, { ...self, sep });
                        }
                    } else {
                        const { nodeDepthMap, nodesMap } = layoutNodes(nodes, undefined, undefined, { ...self, sep });
                        layoutNodesOffset(nodeDepthMap, nodesMap, undefined, { ...self, sep });
                    }

                    // 横向排列时，如果发现edge的source和target的node_depth相同，且type为cubic-v-circle-run，则将type改为cubic-h-circle-run
                    var edges = self.edges;
                    layoutEdges(edges, nodes);
                } catch (err) {
                    console.log(err)
                }
            },
            layout(data) {
                const self = this;
                self.init(data);
                self.execute();
            },
            updateCfg(cfg) { },
            destroy() { },
        }
    }
}
