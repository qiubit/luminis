/*
 * Copyright (C) 2017 Paweł Goliński
 * Copyright (C) 2017 Piotr Wiśniewski
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the LICENSE file for details.
 */


import config from '../../config'
import {
  websocketConnected,
  websocketDisconnected,
  messageFromServer,
} from './actions'

let websocket = null

function createWebsocket(onOpen, onMessage, onClose) {
  websocket = new WebSocket(config.websocketUrl)
  websocket.onopen = onOpen
  websocket.onmessage = onMessage
  websocket.onclose = onClose
}

export function setupWebsocket(dispatch, reconnectInterval = 5000) {
  // We only set up websocket once (it is a singleton)
  if (websocket === null) {
    const onOpen = () => {
      dispatch(websocketConnected())
    }
    const onMessage = (evt) => {
      const dataString = evt.data

      const requestMessage = JSON.parse(dataString)
      dispatch(messageFromServer(requestMessage))
    }
    const onClose = () => {
      dispatch(websocketDisconnected())
      setTimeout(() => {
        createWebsocket(onOpen, onMessage, onClose)
      }, reconnectInterval)
    }
    createWebsocket(onOpen, onMessage, onClose)
  }
}

export function getWebsocket() {
  return websocket
}
