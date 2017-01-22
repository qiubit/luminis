import {
  CONNECT_WEBSOCKET,
  PROCESS_DATA,
  SAVE_WEBSOCKET,
  DATA_RECIEVED,
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
    data: data
  };
}

export function saveWebsocket(websocket) {
  return {
    type: SAVE_WEBSOCKET,
    websocket: websocket
  };
}

export function dataRecieved(newMeasurementData) {
  return {
    type: DATA_RECIEVED,
    newMeasurementData: newMeasurementData
  }
}
