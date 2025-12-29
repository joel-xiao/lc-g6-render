import { fittingString, fittingStringRows, getRectSize, getHealthSetting } from './util'
import { getShapeAnimate, isNotAnimate } from './shape-animate';

export function getGraphShape(type, { cfg, style }) {
  let attrs;
  if (type === 'circle') {
    attrs = {
      r: cfg.size / 2,
    };
  } else if (type === 'hexagonal-polygon') {
    type = 'polygon';
    const size_r = (cfg.size + 12) / 4;
    attrs = {
      points: [
        [-1 * size_r, Math.sqrt(3) * size_r],
        [1 * size_r, Math.sqrt(3) * size_r],
        [2 * size_r, 0 * size_r],
        [1 * size_r, -1 * Math.sqrt(3) * size_r],
        [-1 * size_r, -1 * Math.sqrt(3) * size_r],
        [-2 * size_r, 0 * size_r],
        [-1 * size_r, Math.sqrt(3) * size_r],
      ]
    }
  } else if (type === 'ellipse') {
    attrs = {
      rx: Array.isArray(cfg.size) ? cfg.size[0] / 2 : cfg.size / 2,
      ry: Array.isArray(cfg.size) ? cfg.size[1] / 2 : cfg.size / 2,
    };
  } else {
    // Default fallback to circle attributes to prevent crash
    attrs = {
      r: (Array.isArray(cfg.size) ? cfg.size[0] : cfg.size) / 2 || 15,
    };
  }

  attrs.lineWidth = style.lineWidth || cfg.style.lineWidth || 1;

  return {
    attrs,
    type
  };
}

export function getShape(name) {
  const shape = {
    'group': {
      disabled(g6_example, item, name, value) {

        const model = item.getModel();
        const group = item.get('group');

        const state_names = ['disabled', 'active_by_legend'];
        if (!state_names.some(item_name => item_name === name)) return;

        const event_type = value.event_type;
        value = value.value;

        model[name] = value;

        const hide_opacity = model.id.startsWith('edge-') ? 0.1 : 0.2;

        if (name === 'disabled') {
          if (model[name]) {
            group.attr('opacity', hide_opacity);
            model['disabled_event'] = true;

          } else {
            group.attr('opacity', 1);
            model['disabled_event'] = false;
          }

          if (event_type === 'leave' || event_type === 'clear') {
            if (!model[name] && model['active_by_legend'] !== false) {
              group.attr('opacity', 1);
              model['disabled_event'] = false;
            } else {
              model['disabled_event'] = true;
              group.attr('opacity', hide_opacity);
            }
          }
        }

        if (name === 'active_by_legend') {
          if (model[name]) {
            group.attr('opacity', 1);
            model['disabled_event'] = false;

          } else {
            model['disabled_event'] = true;
            group.attr('opacity', hide_opacity);
          }
        }

        //按事件权重更改禁用状态
        const caching = g6_example.caching;
        const disabled_status = caching.getCaching('event.disabled.select');

        if (disabled_status) {
          if (!model['disabled']) {
            model['disabled_event'] = false;
          }
        }
      }
    },

    'state-halo': {
      name: 'state-halo',
      getCfg() {
        return {
          opacity: ''
          // opacity: '20'
        }
      },

      add(type, { group, cfg, style, name = 'main-box' }) {
        name = name + '-' + this.name;
        const haloWidth = 0;

        const graph_shape = getGraphShape(type, { cfg, style });
        const that_cfg = this.getCfg();
        const attrs = {
          ...graph_shape.attrs,
          x: 0,
          y: 0,
          stroke: style.stroke + that_cfg.opacity,
          opacity: 0,
        };

        for (let i = 0; i < 3; i++) {
          group.addShape(graph_shape.type, {
            attrs: {
              ...attrs,
              lineWidth: attrs.lineWidth + haloWidth,
            },
            'tooltip-event': true,
            'index': i,
            'shape-size': attrs.lineWidth + haloWidth,
            name: name + '-' + i,
          });
        }
      },

      update(item, cfg, style) {
        const that_cfg = this.getCfg();
        const shape_name = this.name;
        const group = item.get('group');
        const group_children = group.get('children');
        group_children.forEach(shape => {
          if (shape.get('name')?.includes(shape_name)) {
            shape.attr('stroke', style.stroke + that_cfg.opacity);
          }
        });
      },

      setState(item, { name, value, style }) {
        const shape_name = this.name;
        const group = item.get('group');
        const group_children = group.get('children');
        let sum = 0;
        group_children.forEach(shape => {
          if (shape.get('name')?.includes(shape_name)) {
            if (shape.attr('show') === false) return;

            if (isNotAnimate()) {
              shape.attr('opacity', value ? 0.3 : 0);
              shape.attr('lineWidth', value ? shape.get('shape-size') + (8 * sum) : 0);
            } else {
              shape.attr('opacity', value ? 1 : 0);

              if (value) {
                getShapeAnimate('ripple').start(shape, item);
              } else {
                getShapeAnimate('ripple').stop(shape, item);
              }
            }


            sum++;
          }
        });
      },

      hide(item) {
        const shape_name = this.name;
        const group = item.get('group');
        const group_children = group.get('children');

        group_children.forEach(shape => {
          if (shape.get('name')?.includes(shape_name)) {
            getShapeAnimate('ripple').stop(shape, item);
            shape.attr('opacity', 0);
            shape.attr('show', false);
          }
        });
      },

      show(item) {
        const shape_name = this.name;
        const group = item.get('group');
        const group_children = group.get('children');

        group_children.forEach(shape => {
          if (shape.get('name')?.includes(shape_name)) {
            shape.attr('opacity', 1);
            shape.attr('show', true);
            getShapeAnimate('ripple').start(shape, item);
          }
        });
      },
    },

    'main-shape': {
      add(type, { group, cfg, style }) {

        const graph_shape = getGraphShape(type, { cfg, style });
        const shape = group.addShape(graph_shape.type, {
          attrs: {
            ...graph_shape.attrs,
            x: 0,
            y: 0,
            stroke: style.stroke,
            fill: style.fill,
          },
          name: 'main-shape',
          'tooltip-event': true,
          'event-name': 'node-main',
          draggable: true,
        });
        return shape;
      },

      update(item, cfg, style) {
        const group = item.get('group');
        const shape = group.find(ele => ele.get('name') === 'main-shape');
        shape.attr({
          stroke: style.stroke,
          fill: style.fill,
        });
      },

      hide(item) {
        const group = item.get('group');
        const shape = group.find(ele => ele.get('name') === 'main-shape');
        shape.attr('opacity', 0);
      },

      show(item) {
        const group = item.get('group');
        const shape = group.find(ele => ele.get('name') === 'main-shape');
        shape.attr('opacity', 1);
      },
    },

    'node-status': {
      name: 'node-status',
      add(G6, { group, cfg, status, position }) {
        if (!status) return;

        position = position || 'right-top';
        const name = this.name + '-' + position + '-group';

        let fontSize = 12;
        const label_text = (status.label || '') + '';
        const labelSize = G6.Util.getTextSize(label_text, 12);

        const lineWidth = 1.5
        const rect_size = 16;
        let padding = 3;
        labelSize[0] = labelSize[0];
        if (labelSize[0] < rect_size) {
          padding = 0;
          labelSize[0] = rect_size;
        }
        if (labelSize[1] < rect_size) labelSize[1] = rect_size;

        const posSetting = {
          'right-top': {
            x: (cfg.size / 2) - (labelSize[0] * 0.8),
            y: (-cfg.size / 2) - (labelSize[1] * 0.5)
          },
        };

        const pos = posSetting[position];

        const labelGroup = group.addGroup({ name });
        labelGroup.addShape('rect', {
          attrs: {
            fill: status.bg,
            x: pos.x - padding,
            y: pos.y,
            width: labelSize[0] + (padding * 2),
            height: labelSize[1],
            lineWidth: lineWidth,
            radius: 3,
          },
          name: name + '-rect',
          draggable: true
        });

        labelGroup.addShape('text', {
          attrs: {
            text: fittingString(G6, label_text, labelSize[0], fontSize, ''),
            x: pos.x + (labelSize[0] / 2),
            y: pos.y + (labelSize[1] / 2),
            fontSize: fontSize,
            textAlign: 'center',
            textBaseline: "middle",
            fill: status.color,
          },
          name: name + '-text',
          draggable: true,
        });
      },
    },

    'text-number': {
      add(G6, { group, cfg, style, data, position }) {
        position = position || 'right-top';
        const name = position + '-group';

        let fontSize = 12;
        const number_text = (data?.number || 0) + '';
        const numberSize = G6.Util.getTextSize(number_text, 12);

        const lineWidth = 1.5
        const rect_size = 16;
        let padding = 4;
        numberSize[0] = numberSize[0] + 4;
        if (numberSize[0] < rect_size) {
          padding = 0;
          numberSize[0] = rect_size;
        }
        if (numberSize[1] < rect_size) numberSize[1] = rect_size;

        const posSetting = {
          'right-top': {
            x: (cfg.size / 2) - (cfg.size * 0.12) - ((rect_size + lineWidth * 2) * 0.5),
            y: (-cfg.size / 2) + (cfg.size * 0.12) - ((rect_size + lineWidth * 2) * 0.5)
          },
          'right-bottom': {
            x: (cfg.size / 2) - (cfg.size * 0.12) - ((rect_size + lineWidth * 2) * 0.5),
            y: (-cfg.size / 2) + (cfg.size * 0.88) - ((rect_size + lineWidth * 2) * 0.5)
          },
        };

        const pos = posSetting[position];

        const numberGroup = group.addGroup({ name });
        numberGroup.addShape('rect', {
          attrs: {
            fill: style.fill,
            stroke: style.stroke,
            x: pos.x - padding,
            y: pos.y,
            width: numberSize[0] + (padding * 2),
            height: numberSize[1],
            lineWidth: lineWidth,
            radius: rect_size / 2
          },
          name: name + '-rect',
          draggable: true
        });

        numberGroup.addShape('text', {
          attrs: {
            text: fittingString(G6, number_text, numberSize[0], fontSize, ''),
            x: pos.x + (numberSize[0] / 2),
            y: pos.y + (numberSize[1] / 2),
            fontSize: fontSize,
            textAlign: 'center',
            textBaseline: "middle",
            fill: style.stroke,
          },
          name: name + '-text',
          draggable: true,
        });
      },
    },

    'arrow': {
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
    },

    'node-icon': {
      name: 'node-icon',
      getIcon(cfg, style) {
        return style?.icons?.[cfg.service_type] || cfg.icon || style.icon;
      },

      getCfg(cfg, style) {
        let icon = this.getIcon(cfg, style);
        if (cfg.service_type && style.icons) {
          if (typeof cfg.service_type === 'string' && cfg.service_type.includes(',')) {
            const services = cfg.service_type.split(',');
            if (services.length === 2) {
              icon = style.icons['default2'];
            }
            if (services.length === 3) {
              icon = style.icons['default3'];
            }

            if (services.length >= 4) {
              icon = style.icons['default4'];
            }
          }
        }

        return {
          icon,
        }
      },

      getName(suffix) {
        return suffix ? this.name + '-' + suffix : this.name;
      },

      add({ group, cfg, style }) {
        if (!cfg.showIcon || !this.getIcon(cfg, style)) return;
        const icon_size = cfg.size - 30;

        const healths = getHealthSetting('_all');
        const statusTypes = Object.keys(healths);
        const legendStatusTypes = statusTypes.filter(key => healths[key].legend !== false);
        if (legendStatusTypes.some(key => cfg.statusType === key)) {
          for (let key of legendStatusTypes) {
            const { icon } = this.getCfg(cfg, healths[key]);
            group.addShape('image', {
              attrs: {
                x: -icon_size / 2,
                y: -icon_size / 2,
                height: icon_size,
                width: icon_size,
                img: icon,
                opacity: cfg.statusType === key ? 1 : 0,
              },
              name: this.getName(key),
              'event-name': 'node-main',
              'tooltip-event': true,
              draggable: true,
            });
          }

        } else {
          const { icon } = this.getCfg(cfg, style);
          group.addShape('image', {
            attrs: {
              x: -icon_size / 2,
              y: -icon_size / 2,
              height: icon_size,
              width: icon_size,
              img: icon,
            },
            name: this.getName(),
            'event-name': 'node-main',
            'tooltip-event': true,
            draggable: true,
          });
        }
      },

      async update(item, cfg, style) {
        const group = item.get('group');
        const children = group.get('children');
        for (let shape of children) {
          if (shape.get('name').startsWith(this.getName() + '-')) {
            if (shape.get('name') === this.getName(cfg.statusType)) {
              shape.attr('opacity', 1);
            } else {
              shape.attr('opacity', 0);
            }
          }
        }
      },
    },

    'node-center-group': {
      name: 'node-center-group',
      getCfg() {
        return {
          centerNumber: {
            fill: '#333',
            fontSize: 20
          }
        }
      },

      add(G6, { group, cfg, style }) {
        const that_cfg = this.getCfg();
        // Center Number
        let centerNumberShape;
        if (cfg?.data?.center_number !== undefined && cfg?.center?.show) {
          const center_number_text = (cfg?.data?.center_number || 0) + '';
          centerNumberShape = group.addShape('text', {
            attrs: {
              text: fittingString(G6, center_number_text, cfg.size, that_cfg.centerNumber.fontSize),
              x: 0,
              y: 0,
              fontSize: that_cfg.centerNumber.fontSize,
              textAlign: 'center',
              fontWeight: 'bold',
              textBaseline: "middle",
              fill: style.stroke || that_cfg.centerNumber.fill,
            },
            name: this.name + '-number',
            'event-name': 'node-main-center-group',
            draggable: true,
          });
        }

        // Circle Text
        if (cfg?.center?.show) {
          const label_fontSize = 12;
          const circle_text = cfg?.center.text;
          const center_icon = cfg?.center.icon || cfg.icon || style.icon;

          // 只有在有Icon or 文本，才将数量向下偏移
          if ((center_icon && cfg?.center.showIcon) || circle_text) {
            // center number
            if (centerNumberShape) centerNumberShape.attrs.y = 14;
          }

          if (cfg?.center.showIcon) {
            // 图标
            const icon_size = cfg.size / 2;
            group.addShape('image', {
              attrs: {
                x: -icon_size / 2,
                y: -icon_size / 1.1,
                height: icon_size,
                width: icon_size,
                img: center_icon,
              },
              name: this.name + '-icon',
              'event-name': 'node-main-center-group',
              'tooltip-event': true,
              draggable: true,
            });

          } else {
            // 文本名称
            group.addShape('text', {
              attrs: {
                text: fittingString(G6, circle_text, cfg.size, label_fontSize),
                x: 0,
                y: -label_fontSize,
                fontSize: label_fontSize,
                textAlign: 'center',
                textBaseline: "middle",
                fill: '#333',
              },
              name: this.name + '-text',
              'event-name': 'node-main-center-group',
              'tooltip-event': true,
              draggable: true,
            });
          }
        }
      },

      update(G6, item, cfg, style) {
        const that_cfg = this.getCfg();
        const group = item.get('group');
        const group_children = group.get('children');
        group_children.forEach(shape => {
          if (shape.get('name') === this.name + '-number') {
            const center_number_text = (cfg?.data?.center_number || 0) + '';
            shape.attr('text', fittingString(G6, center_number_text, cfg.size, that_cfg.centerNumber.fontSize));
            shape.attr('fill', style.stroke || that_cfg.centerNumber.fill);
          }
        });
      },

      hide(item) {
        const group = item.get('group');
        const group_children = group.get('children');
        group_children.forEach(shape => {
          if (shape.get('name').includes(this.name)) {
            shape.attr('opacity', 0);
          }
        });
      },

      show(item) {
        const group = item.get('group');
        const group_children = group.get('children');
        group_children.forEach(shape => {
          if (shape.get('name').startsWith(this.name)) {
            shape.attr('opacity', 1);
          }
        });
      },
    },

    'node-title': {
      name: 'node-title',
      add(G6, { group, cfg, style, position = 'bottom' }) {
        const name = position + '-' + this.name;
        const fontSize = 12;
        const padding = 10;
        const maxWidth = (cfg.size * 2) - (padding * 2);
        const marginBottom = 12;
        const text = fittingStringRows(G6, cfg.title || cfg.label, maxWidth, fontSize) || '--';
        const text_size = getRectSize(G6, text, maxWidth, fontSize);
        const height = text.includes('\n') ? 40 : 20;
        const pos = {
          x: 0,
          y: (cfg.size / 2) + marginBottom,
        };
        const titleGroup = group.addGroup({ name: name + '-group' });
        titleGroup.addShape('rect', {
          attrs: {
            x: (-text_size[0] / 2) - padding,
            y: pos.y,
            fontSize: fontSize,
            fill: style?.titleStyle?.bg || '#CFD9E3',
            width: text_size[0] + (padding * 2),
            height: height,
            radius: 3,
            cursor: '',
          },
          name: name + '-rect',
          'event-name': 'node-title',
        });

        titleGroup.addShape('text', {
          attrs: {
            text,
            x: 0,
            y: pos.y + fontSize + 4.5 + (height - 20),
            fontSize: fontSize,
            lineHeight: 20,
            textAlign: 'center',
            fill: style?.titleStyle?.color || '#000000',
            cursor: '',
          },
          name: name + '-text',
          'event-name': 'node-title',
        });
      },

      hide(item) {
        const group = item.get('group');
        const group_children = group.get('children');
        group_children.forEach(shape => {
          if (shape.get('name').includes(this.name)) {
            shape.attr('opacity', 0);
          }
        });
      },

      show(item) {
        const group = item.get('group');
        const group_children = group.get('children');
        group_children.forEach(shape => {
          if (shape.get('name').includes(this.name)) {
            shape.attr('opacity', 1);
          }
        });
      },

      getRectShape(item) {
        let group = item.get('group');
        const group_children = group.get('children');
        group = group_children.find(shape => shape.get('name').includes(this.name + '-group'));
        return group.get('children').find(shape => shape.get('name').includes(this.name + '-rect'));
      }
    },
  };

  return shape[name];
}

export function getAnchorPoints(name) {
  const data = {
    center: {
      getNodeAnchorPoints(cfg, g6_graph) {
        if (g6_graph.cfg?.layout?.type === "dagre-tbt") {
          return [
            [0.5, 0],
            [0.5, 1],
          ]
        }
      },

      getEdgeAnchorPoints(options) {
        const d = (options ? (options.size / 2) + (options.lineWidth || 0) + (options.offset || 0) : 40);
        return {
          d,
        }
      },
    }
  };
  return data[name];
};
