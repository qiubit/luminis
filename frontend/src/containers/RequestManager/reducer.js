/*
 * Copyright (C) 2017 Paweł Goliński
 * Copyright (C) 2017 Piotr Wiśniewski
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the LICENSE file for details.
 */


/*
 * RequestManager reducer
 *
 * RequestManager deals with sending
 * and receiving data from WebSocket.
 * It manages all data subscriptions.
 *
 */

import { Map } from 'immutable'

import {
  HANDLE_REQUEST,

  PENDING_STATE,
  FRESH_STATE,
  STALE_STATE,
} from './constants'

import {
  SEND_REQUEST,
  SEND_REQUEST_FAIL,
  WEBSOCKET_DISCONNECTED,
  WEBSOCKET_MESSAGE_FROM_SERVER,
} from '../WebsocketConnection/constants'

/*
 * activeRequests - map from request_id to current data for that request.
 *                  Format of the data is as described in communication protocol,
 *                  with additional field 'state' containing:
 *                  PENDING_STATE - no data was yet received (no protocol fields present then)
 *                  FRESH_STATE - data is 'fresh'
 *                  STALE_STATE - data is 'stale' (e.g. websocket was disconnected)
 */
const initialState = new Map({
  activeRequests: new Map(),
})

/*
 * On WebSocket disconnection we want to save
 * data that may still be used, but somehow flag
 * that data stale. That's why in requests that have
 * FRESH_STATE, we change state of the data to STALE_STATE.
 * We also drop PENDING_STATE requests, as they won't be
 * realized anyway.
 */
function websocketDisconnectCallback(activeRequests) {
  return activeRequests
    .filter((requestData) => requestData.get('state') !== PENDING_STATE)
    .map((requestData) => requestData.set('state', STALE_STATE))
}

function requestManagerReducer(state = initialState, action) {
  switch (action.type) {
    case HANDLE_REQUEST:
      if (action.message.type === 'cancel_request') {
        let requestId = action.message.params.request_id
        return state
          .set('activeRequests', state.get('activeRequests').delete(requestId))
      }
      return state
    case SEND_REQUEST_FAIL:
      return state
        .set('activeRequests', state.get('activeRequests').delete(action.request_id))
    case SEND_REQUEST:
      if (action.request.request_id) {
        let updatedRequests = state
          .get('activeRequests')
          .set(action.request.request_id, new Map({ state: PENDING_STATE }))
        return state
          .set('activeRequests', updatedRequests)
      }
      return state
    case WEBSOCKET_DISCONNECTED:
      return state
        .set('activeRequests', websocketDisconnectCallback(state.get('activeRequests')))
    case WEBSOCKET_MESSAGE_FROM_SERVER:
      let serverMessage = new Map({
        state: FRESH_STATE,
        type: action.message.type,
        data: action.message.data,
      })
      // In order to save incoming request data, we must have it subscribed
      if (state.get('activeRequests').get(action.message.request_id)) {
        return state
          .set(
            'activeRequests',
            state.get('activeRequests').set(action.message.request_id, serverMessage))
      }
      return state
    default:
      return state
  }
}

export default requestManagerReducer
