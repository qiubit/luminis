import { combineReducers } from 'redux'

import websocketReducer from './containers/WebsocketConnection/reducer';

export default function createReducer() {
  combineReducers({
    websocketReducer
  })
}
