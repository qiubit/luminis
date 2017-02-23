import { fromJS } from 'immutable';

import {
  SAVE_WEBSOCKET,
} from './constants.js'

const initialState = fromJS({
  websocket: null
});

function websocketReducer(state = initialState, action) {
  switch(action.type) {
    case SAVE_WEBSOCKET:
      return state
        .set('websocket', action.websocket);
    default:
      return state;
  }
}

export default websocketReducer;
