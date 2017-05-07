/*
 * Copyright (C) 2017 Paweł Goliński
 * Copyright (C) 2017 Piotr Wiśniewski
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the LICENSE file for details.
 */


import { fromJS } from 'immutable';
import { combineReducers } from 'redux-immutable';
import { LOCATION_CHANGE } from 'react-router-redux';

import globalReducer from './containers/App/reducer';
import treeListReducer from './containers/TreeList/reducer';
import requestManagerReducer from './containers/RequestManager/reducer'
import nodePageReducer from './containers/NodePage/reducer'

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
    RequestManager: requestManagerReducer,
    NodePage: nodePageReducer,
  });
}
