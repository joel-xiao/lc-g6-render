export function isNotAnimate() {
    const is = window.getGlobalConfig?.('g_g6_topo_animate');
    return is === false;
}

export function isAnimate() {
    return !isNotAnimate();
}
