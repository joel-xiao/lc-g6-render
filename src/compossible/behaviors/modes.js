import getNormalModes from './normal-event/modes';

export function getModels() {
    const modes = getNormalModes();
    // Currently return the default mode array as expected by G6
    return modes.default;
}
