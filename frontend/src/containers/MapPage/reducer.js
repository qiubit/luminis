import { fromJS } from 'immutable';

import {
  CHANGE_ACTIVE_SUBTREE,
} from './constants';

// The initial state of the App
const initialState = fromJS({
  activeSubtreeRoot: 0,
});

function mapReducer(state = initialState, action) {
  switch (action.type) {
    case CHANGE_ACTIVE_SUBTREE:
      return state
        .set('activeSubtreeRoot', action.subtreeId);
    default:
      return state;
  }
}

export default mapReducer;
