import { getEdgeRunningEvent } from './edge-running'
import { getEdgeFocusEvent } from './edge-focus'
import { getLoopEdgeEvent } from './loop-edge'

export const edgeEvents = {
  'edge-running': getEdgeRunningEvent,
  'edge-focus': getEdgeFocusEvent,
  'loop-edge': getLoopEdgeEvent,
}

