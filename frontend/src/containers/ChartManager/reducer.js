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
