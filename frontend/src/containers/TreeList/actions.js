import {
  CHANGE_NODE_TOGGLE,
} from './constants.js'

export function changeNodeToggle(nodeId, nodeToggle) {
  return {
    type: CHANGE_NODE_TOGGLE,
    nodeId,
    nodeToggle
  }
}
