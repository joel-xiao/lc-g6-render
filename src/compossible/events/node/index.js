import { getNodeCollapsedEvent } from './node-collapsed'
import { getNodeActiveEvent } from './node-active'

export const nodeEvents = {
  'node-collapsed': getNodeCollapsedEvent,
  'node-active': getNodeActiveEvent,
}

