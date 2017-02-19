import { fromJS } from 'immutable';

import {
  DRAWER_TOGGLE,
  DRAWER_CHANGE,
} from './constants';



// The initial state of the App
const initialState = fromJS({
  drawerOpen: false,
});

function appReducer(state = initialState, action) {
  switch (action.type) {
    case DRAWER_TOGGLE:
      return state
        .set('drawerOpen', !state.get('drawerOpen'));
    case DRAWER_CHANGE:
      return state
        .set('drawerOpen', action.drawerOpen);
    default:
      return state;
  }
}

export default appReducer;
