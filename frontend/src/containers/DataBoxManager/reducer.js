import { fromJS } from 'immutable'

import { SAVE_DATABOX_REQUESTS } from './constants'


const initialState = fromJS({
  databoxRequests: {}
});

function dataBoxManagerReducer(state = initialState, action) {
  switch (action.type) {
    case SAVE_DATABOX_REQUESTS:
      return state
        .set('databoxRequests', action.databoxRequests)
    default:
      return state;
  }
}

export default dataBoxManagerReducer;
