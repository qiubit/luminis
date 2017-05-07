/*
 * Copyright (C) 2017 Paweł Goliński
 * Copyright (C) 2017 Piotr Wiśniewski
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the LICENSE file for details.
 */


import { fromJS } from 'immutable'

import { SAVE_ACTIVE_REQUEST_ID } from './constants'


const initialState = fromJS({
  activeRequestId: null
});

function chartManagerReducer(state = initialState, action) {
  switch (action.type) {
    case SAVE_ACTIVE_REQUEST_ID:
      return state
        .set('activeRequestId', action.activeRequestId)
    default:
      return state;
  }
}

export default chartManagerReducer;
