import { fromJS } from 'immutable';
import { throttle, put, takeEvery, select } from 'redux-saga/effects';

import { CONNECT_WEBSOCKET, PROCESS_DATA, SEND_REQUEST } from './constants';
import { saveData } from '../App/actions';
import { saveWebsocket } from './actions'
import { selectWebsocket } from './selectors'


function* processData(action) {
  let newData = fromJS(JSON.parse(action.data));
  yield put(saveData(newData));
}

function* connectWebsocket(action) {
  let websocket = new WebSocket(action.url);
  websocket.onopen = action.websocketOnOpen;
  websocket.onmessage = action.websocketOnMessage;
  websocket.onclose = action.websocketOnClose;
  yield put(saveWebsocket(websocket));
}

function* sendRequest(action) {
  let websocket = yield select(selectWebsocket)
  if (websocket) {
    websocket.send(action.request)
  }
}

function* processDataSaga(action) {
  yield takeEvery(PROCESS_DATA, processData);
}

function* connectWebsocketSaga(action) {
  yield throttle(10000, CONNECT_WEBSOCKET, connectWebsocket);
}

function* sendRequestSaga(action) {
  yield takeEvery(SEND_REQUEST, sendRequest)
}

export default [
  processDataSaga,
  connectWebsocketSaga,
  sendRequestSaga,
];
