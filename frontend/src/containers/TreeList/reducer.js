import { fromJS } from 'immutable';

import {
  CHANGE_NODE_TOGGLE,
} from './constants.js'

const initialState = fromJS({
  treeListToggle: {},
});

function TreeListReducer(state = initialState, action) {
  switch(action.type) {
    case CHANGE_NODE_TOGGLE:
      return state
        .set('treeListToggle', state.get('treeListToggle').set(action.nodeId, action.nodeToggle));
    default:
      return state;
  }
}

export default TreeListReducer;
