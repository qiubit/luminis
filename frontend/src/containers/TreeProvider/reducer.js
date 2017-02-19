import { fromJS } from 'immutable';

import {
  SAVE_TREE,
} from './constants.js'

const initialState = fromJS({
  dataTree: [],
});

function treeProviderReducer(state = initialState, action) {
  switch(action.type) {
    case SAVE_TREE:
      return state
        .set('dataTree', action.dataTree);
    default:
      return state;
  }
}

export default treeProviderReducer;
