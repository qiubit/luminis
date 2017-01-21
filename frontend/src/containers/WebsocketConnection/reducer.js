import {
  SAVE_WEBSOCKET,
  DATA_RECIEVED
} from './constants.js'

const initialState = {};

function websocketReducer(state = initialState, action) {
  switch(action.type) {
    case SAVE_WEBSOCKET:
      return Object.assign({}, state, {
        websocket: action.websocket
      })
    case DATA_RECIEVED:
      return Object.assign({}, state, {
        measurement_data: action.new_measurement_data
      })
    default:
      return state;
  }
}

export default websocketReducer;
