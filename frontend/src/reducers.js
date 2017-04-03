import { fromJS } from 'immutable';
import { combineReducers } from 'redux-immutable';
import { LOCATION_CHANGE } from 'react-router-redux';

import globalReducer from './containers/App/reducer';
import treeListReducer from './containers/TreeList/reducer';
import dataBoxManagerReducer from './containers/DataBoxManager/reducer';
import chartManagerReducer from './containers/ChartManager/reducer'

/*
 * routeReducer
 *
 * Needed by react-router-redux@4, because we are using immutable.js
 *
 */

// Initial routing state
const routeInitialState = fromJS({
  locationBeforeTransitions: null,
});

/**
 * Merge route into the global application state
 */
function routeReducer(state = routeInitialState, action) {
  switch (action.type) {
    case LOCATION_CHANGE:
      return state.merge({
        locationBeforeTransitions: action.payload,
      });
    default:
      return state;
  }
}

export default function createReducer() {
  return combineReducers({
    route: routeReducer,
    App: globalReducer,
    TreeList: treeListReducer,
    DataBoxManager: dataBoxManagerReducer,
    ChartManager: chartManagerReducer,
  });
}
