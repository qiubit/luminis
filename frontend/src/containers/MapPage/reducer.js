import { fromJS } from 'immutable';

import {
  SHOW_MAP_TREE,
} from './constants';

// The initial state of the App
const initialState = fromJS({
  tree: [],
  position: [],
});

function mapReducer(state = initialState, action) {
  switch (action.type) {
    case SHOW_MAP_TREE:
      return state
        .set('tree', action.tree)
        .set('position', action.tree.get(0).get('position'));
    default:
      return state;
  }
}

export default mapReducer;
