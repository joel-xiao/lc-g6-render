import CustomTextTooltip from './custom-text-tooltip';
import CustomTooltip from './custom-tooltip';
import CustomHealthLegend from './custom-health-legend';
import CustomLoading from './custom-loading';
import { isEvent } from '../events/index';

const components = {
    'custom-text-tooltip': CustomTextTooltip,
    'custom-tooltip': CustomTooltip,
    'custom-health-legend': CustomHealthLegend,
    'custom-loading': CustomLoading,
};

export function getComponentEvent(name) {
    return components[name];
}

export function onComponentEvent(component_names, evt_type, e, g6_graph, vm, option, cb) {
    if (isEvent(e)) return;

    component_names.forEach(com => {
        const component = getComponentEvent(com);
        if (component) {
            Object.keys(component).forEach((fn_key) => {
                component[fn_key](g6_graph, evt_type, e, vm, option, cb, component);
            })
        }
    });
}
