import Group from './group';
import StateHalo from './state-halo';
import MainShape from './main-shape';
import NodeStatus from './node-status';
import TextNumber from './text-number';
import Arrow from './arrow';
import NodeIcon from './node-icon';
import NodeCenterGroup from './node-center-group';
import NodeTitle from './node-title';

const components = {
    'group': Group,
    'state-halo': StateHalo,
    'main-shape': MainShape,
    'node-status': NodeStatus,
    'text-number': TextNumber,
    'arrow': Arrow,
    'node-icon': NodeIcon,
    'node-center-group': NodeCenterGroup,
    'node-title': NodeTitle
};

export function getComponent(name) {
    return components[name];
}

// Backward compatibility helper if needed, though we should prefer importing getComponent
export const getShape = getComponent; 
