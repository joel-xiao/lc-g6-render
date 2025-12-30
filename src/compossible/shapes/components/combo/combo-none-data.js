const ComboNoneData = {
    name: 'combo-none-data',
    add(G6, { group, cfg }) {
        const noneDataGroup = group.addGroup({
            name: this.name + '-group',
            attrs: {
                opacity: 0,
            }
        });
        noneDataGroup.addShape('image', {
            attrs: {
                x: -100 / 2,
                y: -100 / 2 + 10,
                height: 100,
                width: 100,
                img: '/g6-icons/lc-topo-none-data.svg',
            },
            name: this.name + '-rect',
            draggable: true,
        });
    },

    hide(combo, { cfg, keyShape }) {
        const group = combo.get('group');
        const nodeDataGroup = group.find((ele) => ele.get('name') === this.name + '-group');
        nodeDataGroup?.attr('opacity', 0);
    },

    update(combo, { cfg, keyShape }) {
        const group = combo.get('group');
        const nodeDataGroup = group.find((ele) => ele.get('name') === this.name + '-group');
        const is_not_children = !cfg.children?.length && !combo._cfg.nodes?.length;
        nodeDataGroup?.attr('opacity', is_not_children ? 1 : 0);
    }
};

export default ComboNoneData;
