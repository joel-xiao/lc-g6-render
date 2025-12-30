const ComboCollapsed = {
    name: 'combo-collapsed-group',
    getCfg(cfg, keyShape) {
        const data = {
            size: 20,
            padding: 4,
            radius: 0,
            pos: {
                x: 0,
                y: 0,
            },
        };

        if (keyShape) {
            data.pos = {
                x: (keyShape.attr('width') / 2),
                y: (-keyShape.attr('height') / 2),
            }
        }

        if (cfg.collapsed) {
            data.radius = data.size / 2;
            data.pos.y = (-data.size / 2) - 26;
            data.pos.x = data.pos.x + 10;

        } else {
            data.radius = [3, 0, 0, 3];
            data.pos.x = data.pos.x - data.size;
            data.pos.y = data.pos.y + 40;
        }

        return data;
    },

    getIcon(collapsed) {
        return collapsed ? '/g6-icons/node-expand.svg' : '/g6-icons/node-expand-put.svg';
    },

    add(G6, { group, cfg }) {
        if (!cfg.show_collapsed) return;

        const that_cfg = this.getCfg(cfg);
        const expandGroup = group.addGroup({ name: this.name });
        const pos = {
            x: cfg.style.width / 2 + cfg.padding[1],
            y: (cfg.padding[2] - cfg.padding[0]) / 2,
        }

        expandGroup.addShape('rect', {
            attrs: {
                fill: '#09f',
                x: that_cfg.pos.x,
                y: that_cfg.pos.y,
                width: that_cfg.size,
                height: that_cfg.size,
                radius: that_cfg.radius,
                cursor: 'pointer',
            },
            'event-name': 'combo-collapsed',
            name: this.name + '-rect'
        });

        expandGroup.addShape('image', {
            attrs: {
                x: that_cfg.pos.x + that_cfg.padding,
                y: that_cfg.pos.y + that_cfg.padding,
                height: that_cfg.size - (that_cfg.padding * 2),
                width: that_cfg.size - (that_cfg.padding * 2),
                img: this.getIcon(cfg.collapsed),
                cursor: 'pointer',
            },
            'event-name': 'combo-collapsed',
            name: this.name + '-icon',
            draggable: true,
        });
    },

    update(combo, { cfg, keyShape }) {
        if (!cfg.show_collapsed) return;

        setTimeout(() => {
            const model = combo.getModel();
            const group = combo.get('group');
            const that_cfg = this.getCfg(cfg, keyShape);
            const expandGroup = group.find(item => item.get('name') === this.name);
            const expandRect = expandGroup && expandGroup.find(item => item.get('name') === this.name + '-rect');
            const expandIcon = expandGroup && expandGroup.find(item => item.get('name') === this.name + '-icon');

            expandRect.attr({
                ...that_cfg.pos,
                radius: that_cfg.radius
            });
            expandIcon.attr({
                x: that_cfg.pos.x + that_cfg.padding,
                y: that_cfg.pos.y + that_cfg.padding,
                img: this.getIcon(model.collapsed)
            });
        })
    },

    hide(combo, { cfg }) {
        if (!cfg.show_collapsed) return;

        const group = combo.get('group');
        const expandGroup = group.find(item => item.get('name') === this.name);
        expandGroup.attr('opacity', 0);
    },

    show(combo, { cfg }) {
        if (!cfg.show_collapsed) return;

        const group = combo.get('group');
        const expandGroup = group.find(item => item.get('name') === this.name);
        expandGroup.attr('opacity', 1);
    }
};

export default ComboCollapsed;
