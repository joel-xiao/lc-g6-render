import Group from './common/group';
import StateHalo from './common/state-halo';
import MainShape from './common/main-shape';
import TextNumber from './common/text-number';
import Arrow from './common/arrow';

import NodeStatus from './node/node-status';
import NodeIcon from './node/node-icon';
import NodeCenterGroup from './node/node-center-group';
import NodeTitle from './node/node-title';

import PathRunning from './edge/path-running';
import LoopEdge from './edge/loop-edge';

import ComboCollapsed from './combo/combo-collapsed';
import ComboNoneData from './combo/combo-none-data';

const components = {
    // Common
    'group': Group,
    'state-halo': StateHalo,
    'main-shape': MainShape,
    'text-number': TextNumber,
    'arrow': Arrow,

    // Node
    'node-status': NodeStatus,
    'node-icon': NodeIcon,
    'node-center-group': NodeCenterGroup,
    'node-title': NodeTitle,

    // Edge
    'path-running': PathRunning,
    'loop-edge': LoopEdge,

    // Combo
    'combo-collapsed': ComboCollapsed,
    'combo-none-data': ComboNoneData
};

export function getComponent(name) {
    return components[name];
}

// Backward compatibility helper
export const getShape = getComponent; 
