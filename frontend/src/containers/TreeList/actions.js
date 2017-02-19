import {
  UPDATE_TREE_LIST_TOGGLE,
  CHANGE_NODE_TOGGLE,
} from './constants.js'

export function updateTreeListToggle(tree) {
  return {
    type: UPDATE_TREE_LIST_TOGGLE,
    tree
  }
}

export function changeNodeToggle(nodeId, nodeToggle) {
  return {
    type: CHANGE_NODE_TOGGLE,
    nodeId,
    nodeToggle
  }
}
