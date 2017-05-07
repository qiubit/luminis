/*
 * Copyright (C) 2017 Paweł Goliński
 * Copyright (C) 2017 Piotr Wiśniewski
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the LICENSE file for details.
 */


import { fromJS } from 'immutable'

import {
  DRAWER_TOGGLE,
  DRAWER_CHANGE,
  SAVE_ACTIVE_NODE_ID,
  SAVE_METADATA,
} from './constants'


// The initial state of the App
const initialState = fromJS({
  drawerOpen: true,
  activeNodeId: null,
  nodesMetadata: {},
  treeStructure: [],
  treeTimestamp: null,
  measurementsMetadata: {},
})


function appReducer(state = initialState, action) {
  switch (action.type) {
    case DRAWER_TOGGLE:
      return state
        .set('drawerOpen', !state.get('drawerOpen'))
    case DRAWER_CHANGE:
      return state
        .set('drawerOpen', action.drawerOpen)
    case SAVE_ACTIVE_NODE_ID:
      return state
        .set('activeNodeId', action.nodeId)
    case SAVE_METADATA:
      return state
        .set('nodesMetadata', action.dataTree.get('tree_metadata'))
        .set('treeStructure', action.dataTree.get('tree'))
        .set('measurementsMetadata', action.dataTree.get('measurements_metadata'))
        .set('treeTimestamp', action.dataTimestamp)
    default:
      return state
  }
}

export default appReducer
