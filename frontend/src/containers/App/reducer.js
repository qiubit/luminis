import { fromJS } from 'immutable';

import {
  DRAWER_TOGGLE,
  DRAWER_CHANGE,
  CHANGE_ACTIVE_SUBTREE,
  SAVE_TREE,
  DATA_RECIEVED
} from './constants';



// The initial state of the App
const initialState = fromJS({
  drawerOpen: false,
  activeSubtreeRootId: 0,
  dataTree: [],
  measurementData: {}
});

function appReducer(state = initialState, action) {
  switch (action.type) {
    case DRAWER_TOGGLE:
      return state
        .set('drawerOpen', !state.get('drawerOpen'));
    case DRAWER_CHANGE:
      return state
        .set('drawerOpen', action.drawerOpen);
    case CHANGE_ACTIVE_SUBTREE:
      return state
        .set('activeSubtreeRootId', action.subtreeRootId);
    case SAVE_TREE:
      return state
        .set('dataTree', action.dataTree);
    case DATA_RECIEVED:
      return state
        .set('measurementData', action.newMeasurementData);
    default:
      return state;
  }
}

export default appReducer;
