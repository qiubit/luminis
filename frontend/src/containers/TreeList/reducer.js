import { fromJS } from 'immutable';

import {
  CHANGE_NODE_TOGGLE,
  UPDATE_TREE_LIST_TOGGLE,
} from './constants.js'

const initialState = fromJS({
  treeListToggle: {},
});

function generateTreeListToggle(oldTreeListToggle, dataTree) {
  let newTreeListToggle = oldTreeListToggle;
  let mapTree = (nodes) => {
    nodes.forEach((node) => {
      mapTree(node.get('children'));
      if (!newTreeListToggle.has(node.get('node_id'))) {
        newTreeListToggle = newTreeListToggle.set(node.get('node_id'), false);
      }
    });
  }
  mapTree(dataTree);
  return newTreeListToggle;
}

function TreeListReducer(state = initialState, action) {
  switch(action.type) {
    case CHANGE_NODE_TOGGLE:
      return state
        .set('treeListToggle', state.get('treeListToggle').set(action.nodeId, action.nodeToggle));
    case UPDATE_TREE_LIST_TOGGLE:
      return state
        .set('treeListToggle', generateTreeListToggle(state.get('treeListToggle'), action.tree.get('tree')));
    default:
      return state;
  }
}

export default TreeListReducer;
