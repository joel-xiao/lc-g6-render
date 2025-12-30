export default {
    name: '-arrow-collapse',
    getCfg(cfg, position) {
        const name = position + this.name;
        const base_data = {
            'event-name': 'node-collapsed',
            'collapsed-name': 'collapsed-name-' + name,
            'disabled-name': 'disabled-name-' + name,
            'position-name': position,
            'node-edge-type': position === 'bottom' ? 'out-edges' : 'in-edges',
            name: name,
        };

        const expendSize = 16;
        const posSetting = {
            'bottom': {
                x: (-expendSize * 0.5),
                y: (cfg.size / 2) - (expendSize * 0.5)
            },
            'top': {
                x: (-expendSize * 0.5),
                y: (-cfg.size / 2) - (expendSize * 0.5)
            }
        };
        const pos = posSetting[position];

        const size_r = (expendSize - 6) / 2;
        const offset = 6;
        const pointsSetting = {
            top: [
                [0, pos.y + 4.5],
                [-size_r, pos.y + size_r + 4.5],
                [size_r, pos.y + size_r + 4.5],
            ],
            bottom: [
                [-size_r, pos.y + offset],
                [size_r, pos.y + offset],
                [0, pos.y + size_r + offset],
            ],
        };
        const points = pointsSetting[position];

        const arrow = { 'bottom': 'top', 'top': 'bottom' };
        const arrowPoints = pointsSetting[arrow[position]];

        return {
            expendSize,
            base_data,
            pos,
            points,
            arrowPoints,
        }
    },

    setDisabled(shape, value) {
        shape.attr('opacity', value ? 0 : 1);
        shape.attr('cursor', value ? undefined : 'pointer');
    },

    add(type, { group, cfg, style, position = 'bottom' }) {
        if (cfg.disabled_collapse) return;

        const base_cfg = this.getCfg(cfg, position);
        const expendGroup = group.addGroup({ name: base_cfg.base_data.name + '-group' });
        expendGroup.addShape(type, {
            attrs: {
                fill: '#09f',
                stroke: '#fff',
                x: base_cfg.pos.x,
                y: base_cfg.pos.y,
                height: base_cfg.expendSize,
                width: base_cfg.expendSize,
                radius: base_cfg.expendSize / 2,
                lineWidth: 1,
                opacity: 0,
                cursor: 'pointer',
            },
            ...base_cfg.base_data,
        });

        expendGroup.addShape('polygon', {
            attrs: {
                fill: '#fff',
                points: cfg[base_cfg.base_data['collapsed-name']] ? base_cfg.arrowPoints : base_cfg.points,
                opacity: 0,
                cursor: 'pointer',
            },
            ...base_cfg.base_data,
            name: base_cfg.base_data.name + '-polygon'
        });
    },

    setState(item, { style, value }) {
        const model = item.getModel();

        if (model.disabled_collapse) return;

        const children = item.get('group').get('children').filter(item => item.get('name').includes(this.name));
        const is_show_collapse = value.name === 'show_collapse';
        const is_collapsed_name = value.name?.startsWith('collapsed-name') || value.name === 'collapsed-name';
        const is_disabled_name = value.name?.startsWith('disabled-name') || value.name === 'disabled-name';

        if (is_collapsed_name || is_show_collapse || is_disabled_name) {
            children.forEach((item) => {
                const children = item.get('children');

                children.forEach(child => {
                    const arrow_node_edge_type = child.get('node-edge-type');
                    const disabled_name = child.get('disabled-name');
                    const disabled_collapse = model[disabled_name];

                    // 当前节点某一个箭头显示隐藏处理
                    if (is_disabled_name && arrow_node_edge_type === value['node-edge-type']) {
                        // 更新状态
                        model[disabled_name] = value.value;
                        this.setDisabled(child, value.value);
                        child.set('disabled-event', value.value);
                        return;
                    }

                    // 当前节点某一个箭头显示隐藏处理
                    if (disabled_name === value.name) {
                        this.setDisabled(child, disabled_collapse);
                        child.set('disabled-event', disabled_collapse);
                        return;
                    }

                    // 如果已禁用隐藏该按钮则直接 return；
                    if (disabled_collapse) return;

                    const collapsed_name = child.get('collapsed-name');
                    // collapse 箭头展开收起
                    if (is_collapsed_name && arrow_node_edge_type === value['node-edge-type']) {
                        const name = child.get('name');
                        if (!name.endsWith('-polygon')) return;

                        // 更新状态
                        model[collapsed_name] = value.value;

                        let position = child.get('position-name');
                        const base_cfg = this.getCfg(model, position);
                        child.attr('points', model[collapsed_name] ? base_cfg.arrowPoints : base_cfg.points);
                        return;

                    }

                    // collapse 箭头展开收起
                    if (collapsed_name === value.name) {
                        const name = child.get('name');
                        if (!name.endsWith('-polygon')) return;

                        // 更新状态
                        model[collapsed_name] = value.value;

                        let position = child.get('position-name');
                        const base_cfg = this.getCfg(model, position);
                        child.attr('points', model[collapsed_name] ? base_cfg.arrowPoints : base_cfg.points);
                        return;
                    }

                    // 当前节点所有的 arrow 显示隐藏处理
                    if (is_show_collapse) {
                        this.setDisabled(child, !value.value);
                        return;
                    }
                })
            });
        }
    }
}
