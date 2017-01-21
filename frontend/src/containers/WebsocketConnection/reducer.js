import {
  SAVE_WEBSOCKET
} from './constants.js'

const initialState = {};

function websocketReducer(state = initialState, action) {
  switch(action.type) {
    case SAVE_WEBSOCKET:
      return Object.assign({}, state, {
        websocket: action.websocket
      })
    default:
      return state;
  }
}

export default websocketReducer;
