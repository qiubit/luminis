import { throttle, put, takeEvery, select } from 'redux-saga/effects'
import { CONNECT_WEBSOCKET, PROCESS_DATA } from './constants';
import { saveWebsocket, dataRecieved } from './actions';
import { parseDataFromWebsocket } from './parsers'
import { getMeasurementData } from './selectors'

function* connectWebsocket(action) {
  let websocket = new WebSocket(action.url);
  websocket.onopen = action.websocketOnOpen;
  websocket.onmessage = action.websocketOnMessage;
  websocket.onclose = action.websocketOnClose;
  yield put(saveWebsocket(websocket));
}

function* connectWebsocketSaga(action) {
  yield throttle(10000, CONNECT_WEBSOCKET, connectWebsocket);
}

function* processData(action) {
  let measurementData = yield select(getMeasurementData);
  let newMeasurementData = parseDataFromWebsocket(measurementData, action.data);
  yield put(dataRecieved(newMeasurementData));
}

function* processDataSaga(action) {
  yield takeEvery(PROCESS_DATA, processData);
}

export default [
  connectWebsocketSaga,
  processDataSaga
];
