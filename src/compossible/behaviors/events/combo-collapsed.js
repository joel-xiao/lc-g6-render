export default {
    click(g6_graph, e, that, option) {
        if (e.target.get('event-name') === 'combo-collapsed') {
            g6_graph.collapseExpandCombo(e.item);

            g6_graph.layout();
            let timer, timer2;
            clearTimeout(timer);
            clearTimeout(timer2);
            timer = setTimeout(() => {
                option.g6_example.focusNode(e);
                clearTimeout(timer);
                timer2 = setTimeout(() => {
                    option.g6_example.updateMinimap();
                    clearTimeout(timer2);
                }, 500);
            }, 200);
        }
    }
}
