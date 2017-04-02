import {
  CONNECT_WEBSOCKET,
  PROCESS_DATA,
  SAVE_WEBSOCKET,
  SEND_REQUEST,
  WEBSOCKET_CONNECTED,
  WEBSOCKET_DISCONNECTED,
  SEND_REQUEST_OK,
  SEND_REQUEST_FAIL,
  REQUEST_MESSAGE,
} from './constants';

export function connectWebsocket(url, onOpen, onMessage, onClose) {
  return {
    type: CONNECT_WEBSOCKET,
    url: url,
    websocketOnOpen: onOpen,
    websocketOnMessage: onMessage,
    websocketOnClose: onClose,
  };
}

export function processData(data) {
  return {
    type: PROCESS_DATA,
    data,
  };
}

export function saveWebsocket(websocket) {
  return {
    type: SAVE_WEBSOCKET,
    websocket,
  };
}

export function sendRequest(request) {
  return {
    type: SEND_REQUEST,
    request,
  };
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

export function requestMessage(message) {
  return {
    type: REQUEST_MESSAGE,
    message,
  }
}
