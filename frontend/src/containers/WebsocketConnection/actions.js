/*
 * Copyright (C) 2017 Paweł Goliński
 * Copyright (C) 2017 Piotr Wiśniewski
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the LICENSE file for details.
 */


import {
  WEBSOCKET_CONNECTED,
  WEBSOCKET_DISCONNECTED,
  SEND_REQUEST,
  SEND_REQUEST_OK,
  SEND_REQUEST_FAIL,
  WEBSOCKET_MESSAGE_FROM_SERVER,
} from './constants'

export function sendRequest(request) {
  return {
    type: SEND_REQUEST,
    request,
  }
}

/* Parts of the new API (not yet implemented) */
export function websocketConnected() {
  return {
    type: WEBSOCKET_CONNECTED,
  }
}

export function websocketDisconnected() {
  return {
    type: WEBSOCKET_DISCONNECTED,
  }
}

export function sendRequestSuccess(request_id) {
  return {
    type: SEND_REQUEST_OK,
    request_id,
  }
}

export function sendRequestFail(request_id) {
  return {
    type: SEND_REQUEST_FAIL,
    request_id,
  }
}

export function messageFromServer(message) {
  return {
    type: WEBSOCKET_MESSAGE_FROM_SERVER,
    message,
  }
}
