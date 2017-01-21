import { throttle, put } from 'redux-saga/effects'
import { CONNECT_WEBSOCKET } from './constants';
import { saveWebsocket } from './actions';


function* generateWebsocket(action) {
  let websocket = new WebSocket(action.url);
  websocket.onopen = action.websocketOnOpen;
  websocket.onmessage = action.websocketOnMessage;
  websocket.onclose = action.websocketOnClose;
  yield put(saveWebsocket(websocket));
}

function* connectWebsocketSaga(action) {
  yield throttle(10000, CONNECT_WEBSOCKET, generateWebsocket);
}

export default [
  connectWebsocketSaga,
];
