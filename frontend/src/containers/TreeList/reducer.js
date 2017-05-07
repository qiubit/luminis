/*
 * Copyright (C) 2017 Paweł Goliński
 * Copyright (C) 2017 Piotr Wiśniewski
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the LICENSE file for details.
 */


import { fromJS } from 'immutable'

import {
  CHANGE_NODE_TOGGLE,
} from './constants.js'

const initialState = fromJS({
  treeListToggle: {},
})


function TreeListReducer(state = initialState, action) {
  switch(action.type) {
    case CHANGE_NODE_TOGGLE:
      return state
        .set('treeListToggle', state.get('treeListToggle').set(action.nodeId, action.nodeToggle))
    default:
      return state
  }
}

export default TreeListReducer
