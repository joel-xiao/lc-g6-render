import { registerLayout as dagreTgb } from './dagre-tgb/index';
import { registerLayout as dagreTbt } from './dagre-tbt/index';

export const registerLayout = {
    ...dagreTgb,
    ...dagreTbt
};
