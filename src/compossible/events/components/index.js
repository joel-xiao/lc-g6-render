import { getCustomTextTooltipEvent } from './custom-text-tooltip'
import { getCustomTooltipEvent } from './custom-tooltip'
import { getCustomLegendEvent } from './custom-legend'
import { getCustomLoadingEvent } from './custom-loading'

export const componentEvents = {
  'custom-text-tooltip': getCustomTextTooltipEvent,
  'custom-tooltip': getCustomTooltipEvent,
  'custom-legend': getCustomLegendEvent,
  'custom-loading': getCustomLoadingEvent,
}

