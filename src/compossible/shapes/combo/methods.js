
import G6 from "@antv/g6";
import { fittingString, getRectSize } from '../../utils/text';
import { getHealthSetting } from '../../utils/health';

export function getComboShape(name) {
    const shape = {
        'combo-keyShape': {
            name: 'combo-keyShape',
            getCfg(cfg, style, change_type) {
                const data = {
                    width: style.width,
                    height: style.height,
                    style: {
                        fill: cfg.fill,
                        stroke: cfg.stroke,
                    },

                    pos: {
                        x: 0,
                        y: 0,
                    }
                };

                // 当被切换时则相加padding
                data.width = data.width + (cfg.padding[3] + cfg.padding[1]);
                data.height = data.height + (cfg.padding[0] + cfg.padding[2]);

                data.pos = {
                    x: -data.width / 2 - (cfg.padding[3] - cfg.padding[1]) / 2,
                    y: -data.height / 2 - (cfg.padding[0] - cfg.padding[2]) / 2,
                }

                return data;
            },

            add(G6, { group, cfg, style }) {
                const that_cfg = this.getCfg(cfg, style);
                return group.addShape('rect', {
                    attrs: {
                        ...style,
                        ...that_cfg.pos,
                        width: that_cfg.width,
                        height: that_cfg.height,
                        fill: that_cfg.style.fill,
                        stroke: that_cfg.style.stroke,
                        lineDash: [3],
                        radius: 3,

                    },
                    draggable: true,
                    name: this.name,
                });
            },

            getShape(combo) {
                const group = combo.get('group');
                return group.find((ele) => ele.get('name') === this.name);
            },

            update(combo, { cfg, style }, cb) {
                const that_cfg = this.getCfg(cfg, style, 'update');
                const shape = this.getShape(combo);

                cb?.();
            },

            hide(combo) {
                const shape = this.getShape(combo);
                if (!shape) return;
                shape.attr('strokeOpacity', 0);
                shape.attr('fillOpacity', 0);

                const group = combo.get('group');
                const group_children = group.get('children');
                group_children.forEach(shape => {
                    if (shape.get('name') !== 'text-shape') return;
                    shape.attr('strokeOpacity', 0);
                    shape.attr('fillOpacity', 0);
                });
            },

            show(combo) {
                const shape = this.getShape(combo);
                if (!shape) return;
                shape.attr('strokeOpacity', 1);
                shape.attr('fillOpacity', 1);

                const group = combo.get('group');
                const group_children = group.get('children');
                group_children.forEach(shape => {
                    if (shape.get('name' !== 'text-shape')) return;
                    shape.attr('strokeOpacity', 1);
                    shape.attr('fillOpacity', 1);
                });
            }
        },

        'combo-header': {
            name: 'combo-header',
            add(G6, { group, cfg }) {
                const header = cfg.header;
                if (!header?.show) return;

                const header_name = this.name;
                const headerGroup = group.addGroup({ name: header_name + '-group' });

                // Header Background
                headerGroup.addShape('rect', {
                    attrs: {
                        x: cfg.x,
                        y: cfg.y,
                        width: cfg.style.width,
                        height: 28,
                        fill: header?.style.fill,
                    },
                    draggable: true,
                    name: header_name + '-rect',
                });

                // Header Left Label
                headerGroup.addShape('text', {
                    attrs: {
                        text: '',
                        x: cfg.x,
                        y: cfg.y,
                        textAlign: 'left',
                        height: 28,
                        width: 0,
                        fill: header?.style.stroke

                    },
                    'text-tooltip': true,
                    draggable: true,
                    name: header_name + '-label',
                });

                // Header Right Number
                let rights = [...(cfg?.header?.rights || [])];
                rights = rights.reverse();
                rights.forEach((item, idx) => {
                    const rightGroup = headerGroup.addGroup({ name: header_name + '-right-group-' + idx });

                    rightGroup.addShape('circle', {
                        attrs: {
                            r: 4,
                            x: cfg.x,
                            y: cfg.y,
                            fill: item.fill || header?.style.stroke
                        },
                        draggable: true,
                        name: header_name + '-circle-' + idx,
                    });

                    rightGroup.addShape('text', {
                        attrs: {
                            text: '',
                            x: cfg.x,
                            y: cfg.y,
                            textAlign: 'right',
                            height: 28,
                            width: 0,
                            fill: item.fill || header?.style.stroke
                        },
                        draggable: true,
                        name: header_name + '-number-' + idx,
                    });
                });
            },

            update(combo, { cfg, keyShape }, cb) {
                const group = combo.get('group');
                if (!group) return;
                const that = this;
                const header_name = this.name;
                setTimeout(() => {
                    setShapeRect();
                });

                function setShapeRect() {
                    const headerGroup = group.find((ele) => ele.get('name') === 'combo-header-group');
                    if (!headerGroup) return;

                    const headerRect = headerGroup.find(ele => ele.get('name') === 'combo-header-rect');
                    const headerLabelShape = group.find((ele) => ele.get('name') === 'combo-header-label');

                    if (!cfg.collapsed) {
                        const padding = 10;

                        // Header Rect
                        headerRect.attr({
                            x: keyShape.attr('x'),
                            y: keyShape.attr('y'),
                            width: keyShape.attr('width')
                        });

                        // Header Right Number
                        let rights = [...(cfg?.header?.rights || [])];
                        rights = rights.reverse();
                        const row_w = 10;
                        let rights_width = 0;
                        rights.forEach((item, idx) => {
                            const rightGroup = group.find((ele) => ele.get('name') === header_name + '-right-group-' + idx)
                            const rightTextShape = rightGroup.find((ele) => ele.get('name') === header_name + '-number-' + idx);
                            const text = (item?.label || "--") + ': ' + (cfg?.data?.[item.key] || 0);
                            const size = 12;
                            const textSize = getRectSize(G6, text, 140, size);
                            rightTextShape.attr('text', text);
                            rightTextShape.attr('width', textSize[0]);
                            rightTextShape.attr('y', keyShape.attr('y') + (padding * 2));
                            rightTextShape.attr('x', keyShape.attr('x') + (keyShape.attr('width') - padding) - rights_width);
                            rights_width += Number(rightTextShape.attr('width')) + row_w;

                            const rightCircleShape = rightGroup.find((ele) => ele.get('name') === header_name + '-circle-' + idx);
                            const circle_w = rightCircleShape.attr('r') * 2;
                            rightCircleShape.attr('y', keyShape.attr('y') + (padding * 2) - (size - (circle_w / 2) - 2));
                            rightCircleShape.attr('x', keyShape.attr('x') + (keyShape.attr('width') - padding) - rights_width);
                            rights_width += circle_w + row_w;
                        });

                        // Header Label
                        let mainWidth = keyShape.attr('width');
                        const labelMaxWidth = mainWidth - (padding * 3) - rights_width;
                        const labelFontSize = 12;
                        const labelText = cfg.title || '';
                        const labelWidth = getRectSize(G6, labelText, labelMaxWidth, labelFontSize)[0];
                        headerLabelShape.attr('text', fittingString(G6, labelText, labelWidth, labelFontSize));
                        headerLabelShape.attr('y', keyShape.attr('y') + (padding * 2));
                        headerLabelShape.attr('x', keyShape.attr('x') + padding);
                    }

                    // CallBack
                    cb?.();
                }
            },

            hide(combo, { cfg, keyShape }) {
                const group = combo.get('group');
                const headerGroup = group.find((ele) => ele.get('name') === 'combo-header-group');
                headerGroup?.attr('opacity', 0);
            },

            show(combo, { cfg, keyShape }) {
                const group = combo.get('group');
                const headerGroup = group.find((ele) => ele.get('name') === 'combo-header-group');
                headerGroup?.attr('opacity', 1);
            }
        },

        'combo-collapsed': {
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
        },

        'combo-none-data': {
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
        },
    }

    return shape[name];
}

export function getComboMethods(name) {
    const data = {
        'custom-combo': {
            getCfg(cfg) {
                return cfg;
            }
        }
    }

    return data[name];
}
