import { registerLayout as depthVertical } from './depth-vertical/index';
import { registerLayout as depthGrid } from './depth-grid/index';

export const registerLayout = {
    ...depthVertical,
    ...depthGrid
};
