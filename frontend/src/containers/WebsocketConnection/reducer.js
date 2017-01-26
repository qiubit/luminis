import { fromJS } from 'immutable';

import {
  SAVE_WEBSOCKET,
  DATA_RECIEVED
} from './constants.js'

const initialState = fromJS({
  measurementData: {},
});

function websocketReducer(state = initialState, action) {
  switch(action.type) {
    case SAVE_WEBSOCKET:
      return state
        .set('websocket', action.websocket);
    case DATA_RECIEVED:
      return state
        .set('measurementData', action.newMeasurementData);
    default:
      return state;
  }
}

export default websocketReducer;
