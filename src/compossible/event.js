// 从 events 模块重新导出所有函数，保持向后兼容
export {
  isEvent,
  getEvent,
  getComponentEvent,
  onEvent,
  onComponentEvent,
} from './events/index.js'
