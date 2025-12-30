import { cloneDeep } from 'lodash'
import { getTooltipStatus } from '../utils/index'

export async function getContent(model, options, item_vm, refresh = false, id = '') {
    let curr_model = model;
    let modelData = model.data || {};
    let optWidth = options?.width || '';
    let result = [];
    let tooltip_name = model.id.startsWith('edge') ? 'edge' : 'node';
    if (model.type === 'custom-combo') {
        tooltip_name = 'combo';
    }

    const options_data = typeof options.data === 'function' ? await options.data(model, tooltip_name, item_vm) : options.data;
    if (!options_data) return;
    if (tooltip_name === 'edge') {
        const opt_edges = options_data[tooltip_name];
        const sourceNode = item_vm.getSource();
        const targetNode = item_vm.getTarget();
        const sourceNodeModel = sourceNode.getModel();
        const custom_source = id === sourceNodeModel.id ? sourceNode : targetNode;
        const custom_target = id === sourceNodeModel.id ? targetNode : sourceNode;
        const isSelfCalling = !!(model?.source === model?.target);
        const custom_source_out_edge = custom_source.getOutEdges().find(edge => {
            const edge_model = edge.getModel();
            const custom_source_model = custom_source.getModel();
            const custom_target_model = custom_target.getModel();
            return edge_model.source === custom_source_model.id && edge_model.target === custom_target_model.id;
        });
        const custom_source_in_edge = custom_source.getInEdges().find(edge => {
            const edge_model = edge.getModel();
            const custom_source_model = custom_source.getModel();
            const custom_target_model = custom_target.getModel();
            return edge_model.source === custom_target_model.id && edge_model.target === custom_source_model.id;
        });

        const is_flag = model.source !== model.target;
        if (is_flag && custom_source_out_edge && custom_source_in_edge) {
            const out_edge_model = custom_source_out_edge.getModel();
            const in_edge_model = custom_source_in_edge.getModel();
            modelData = {
                to: in_edge_model?.data,
                from: out_edge_model.data,
                to_model: in_edge_model,
                from_model: out_edge_model,
            };
            model.data_tooltip_key = 'duplex';
        } else {
            if (sourceNodeModel.node_depth < 0) {
                modelData = { to: model.data || [] };
                model.data_tooltip_key = 'to';
            } else {
                modelData = { from: model.data || {} };
                model.data_tooltip_key = 'from';
            }
        }
        if (opt_edges) {
            result = opt_edges.map(r => {
                r.label = isSelfCalling ? '自调用' : r.label;
                return r;
            });
        } else {
            const edge_metrics = options_data[tooltip_name + '_metrics'] || [];
            result = [
                { label: isSelfCalling ? '自调用' : '调入', link: options_data?.link !== undefined ? options_data.link : true, data_key: 'to', metrics: edge_metrics },
                { label: isSelfCalling ? '自调用' : '调出', link: options_data?.link !== undefined ? options_data.link : true, data_key: 'from', metrics: edge_metrics },
            ];
        }


    } else {
        result = options_data[tooltip_name];
    }
    if (!result) return;
    result = cloneDeep(result);

    for (let item of result) {
        if (typeof item.metrics === 'function') item.metrics = await item.metrics(item, model);
    }

    const outDiv = document.createElement('div');
    outDiv.className = 'lc-g6-tooltip-default';

    //是否是双向箭头
    const hasToAndFrom = !!(modelData?.to && modelData?.from && model.target !== model.source);
    Object.keys(options.events || {}).forEach((key) => {
        outDiv.addEventListener(key, function (event) {
            const e_target = event.target;
            let target = 'tooltip';
            let target_id = id;
            let item_idx, metric_idx;
            if (e_target.className.startsWith('link-img') || e_target.className.startsWith('lc-g6-tooltip-item-label') || e_target.className.startsWith('link')) {
                if (options_data.link === false) return;
                target = 'item-label'
                item_idx = Number(e_target.getAttribute('item-idx'));
                if (!result[item_idx]?.link) return;
                outDiv.style.display = 'none';

                if (tooltip_name === 'edge') {
                    curr_model = modelData[result[item_idx].data_key + '_model'] || curr_model;
                }

            } else if (e_target.className.startsWith('lc-g6-tooltip-item-metric-label')) {
                if (options_data.link === false) return;
                target = 'metric-label'
                item_idx = Number(e_target.getAttribute('item-idx'));
                metric_idx = Number(e_target.getAttribute('metric-idx'));
                if (!result[item_idx]?.metrics[metric_idx]?.link) return;
                outDiv.style.display = 'none';

            } else if (e_target.className.startsWith('tab-item')) {
                target = 'tab-click';
                target_id = e_target.getAttribute('item-id')
            }

            target && options.events[key]?.({
                target,
                target_id,
                item: result[item_idx],
                metric_idx,
                model: curr_model,
            }, event);
        }, { passive: true });
    });

    const containerDiv = document.createElement('div');
    containerDiv.className = 'lc-g6-tooltip-container ' + (hasToAndFrom ? 'not-left-top-radius to-and-from' : (tooltip_name === 'edge' && model.target === model.source ? 'no-flex' : ''));
    containerDiv.style.width = options_data?.width || optWidth;
    containerDiv.setAttribute('tooltip_name', tooltip_name);
    // 此时判断是否有to 和 from的数据
    if (hasToAndFrom) {
        const sourceNode = item_vm.getSource();
        const targetNode = item_vm.getTarget();
        const sourceNodeModel = sourceNode.getModel();
        const targetNodeModel = targetNode.getModel();
        const tabDiv = document.createElement('div');
        tabDiv.className = 'lc-g6-tooltip-tab';
        tabDiv.innerHTML = `
    <span title="${targetNodeModel.title}" class="tab-item ${id === targetNodeModel.id ? 'active' : (!refresh ? 'active' : '')}" item-id=${targetNodeModel.id}>${targetNodeModel.title}</span>
    <span title="${sourceNodeModel.title}" class="tab-item ${id === sourceNodeModel.id ? 'active' : ''}" item-id=${sourceNodeModel.id}>${sourceNodeModel.title}</span>
     `;
        tabDiv.style.width = options_data?.width || optWidth;
        outDiv.appendChild(tabDiv);
    }

    let isAlone = false;
    if (tooltip_name === 'node' || tooltip_name === 'combo') {
        const hasIn = result.find(r => r.label === '调入');
        const hasOut = result.find(r => r.label === '调出');
        if (hasIn && hasOut) {

        } else {
            isAlone = true;
            containerDiv.style.width = '260px';
        }
    }

    // 只有调出的时候，不显示问题数
    let hasEdgeIn = false;
    result.forEach(r => {
        if (r.label === '调入' || r.node_key === 'in') {
            hasEdgeIn = true;
        }
    });

    if (!hasEdgeIn) {
        const findMetricHeader = result.find(r => r?.type && r.type === 'metric-header');
        if (findMetricHeader) {
            findMetricHeader.metrics = [{ label: '', key: '' }];
            findMetricHeader.noMetric = true;
        }
    }

    const status = getTooltipStatus(curr_model);
    let status_html = status && `
    <div 
      class="lc-g6-tooltip-status" 
      style="background: ${status.bg};color: ${status.color};"
     >
      ${status.label || ''}
      
      ${status.desc ? `<img src="/g6-icons/question.svg" title=${status.desc} style="padding-left: 3px">` : ''}
    </div>
  `;

    containerDiv.innerHTML = `
    ${result.map((item, item_idx) => {
        const item_data = item.data_key ? modelData?.[item.data_key] : modelData;
        return item_data ? `
        <div class="lc-g6-tooltip-item ${tooltip_name} ${item.type ? item.type : ''} ${item.noMetric ? 'no-metric' : ''}" data_key="${item.type ? '' : item.data_key}" type="${item.type}" style="width: ${item.width ? (isAlone ? '100%' : item.width) : 'auto'}; background: ${(!item.type && !item.link) ? (item.bgColor ? item.bgColor : 'transparent') : 'transparent'}; margin-right: ${isAlone ? 0 : (item.mgR || 0)}; margin-top: ${item.mgT || 0}; padding-bottom: ${item.pdB || 0}">
          ${item.label ?
                `<div  class="lc-g6-tooltip-item-label ${item.link ? 'link' : ''} ${(!item.type && !item.link) ? item.node_key : ''}" item-idx="${item_idx}" style="max-width: ${isAlone ? '128px' : ''}">
              <span class="${item.link ? 'link' : ''}" item-idx="${item_idx}" title="${item.label}"> ${item.label}</span>
              
              ${item.link ? `<img class="link-img ${item.link ? 'link' : ''}" item-idx="${item_idx}" src="/g6-icons/label-link.svg"/>` : ''}
              
              ${item.type === 'metric-header' ? status_html || '' : ''}
            </div>` : ''
            }

          <div class="lc-g6-tooltip-item-content" style="padding: ${item.type === 'metric-header' ? '0' : '0 16px'};max-height: ${item.maxHeight || 'auto'};">${item.metrics?.length ? item.metrics.map((metric, metricIdx) => `
              <div class="lc-g6-tooltip-item-metric" key-name=${metric.key}>
                <div title="${metric.label}" class="lc-g6-tooltip-item-metric-label ${item.prix !== false ? 'prix' : ''} ${metric.link ? 'link' : ''}" item-idx=${item_idx} metric-idx=${metricIdx}>
                  ${metric.label}
                </div>
                <div class="lc-g6-tooltip-item-metric-value">
                  ${(metric.format && metric.format(metric, item_data)) || metric.value || item_data?.[metric.key] || (item.noMetric ? '' : 0)}
                </div>
              </div>
            `).join('') : `<div class="lc-g6-tooltip-item-content-not">${item.metrics ? '暂无数据' : ''}</div>`
            }</div>
        </div>
      ` : '';
    }).join('')
        }
  `;

    if (containerDiv.innerHTML.trim()) {
        outDiv.appendChild(containerDiv);
    }


    return outDiv;
}
