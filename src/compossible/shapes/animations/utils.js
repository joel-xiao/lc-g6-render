export function isNotAnimate(graph) {
    if (!graph) return false;
    const is = graph.get('topo_animate');
    return is === false;
}

export function isAnimate(graph) {
    return !isNotAnimate(graph);
}
