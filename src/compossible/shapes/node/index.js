import * as NodeIcon from './node-icon/index';

export function getRegisterNode(g6_example) {
    // Inject g6_example into the definition or bind it
    // This is a factory function to maintain closure access if needed, 
    // or we can attach g6_example to the node definition or prototype.

    const nodeDef = { ...NodeIcon };
    nodeDef.g6_graph = g6_example.g6_graph;
    nodeDef.g6_example = g6_example;

    return {
        'node-icon': {
            register: 'rect',
            node: nodeDef,
            options: NodeIcon.defaults,
        }
    };
}
