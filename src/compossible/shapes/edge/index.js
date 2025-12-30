import * as CircleRun from './circle-run/index';

export function getRegisterEdge(g6_example) {
    const registerEdge = {
        ...CircleRun.getRegister(g6_example),
    }

    return registerEdge;
}
