import { throttle, put, select, takeEvery } from 'redux-saga/effects'
import { CONNECT_WEBSOCKET, PROCESS_DATA } from './constants';
import { saveWebsocket, dataRecieved } from './actions';
import { insertToSortedArray } from './utils';

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


function dataPointComparator(a, b) {
  return a.timestamp < b.timestamp;
}

function parseMeasurements(data_for_id, measurements) {
  let new_data_for_id = new Map(data_for_id);
  for (var i = 0; i < measurements.length; ++i) {
    let data_point = measurements[i]
    let timeseries = [];
    if (new_data_for_id.has(data_point.name)) {
      timeseries = new_data_for_id.get(data_point.name).slice();
    }
    insertToSortedArray(dataPointComparator, data_point, timeseries);
    if (timeseries.length > 10) {
      timeseries = timeseries.slice(timeseries.length - 10, 10);
    }
    new_data_for_id.set(data_point.name, timeseries);
  }
  return new_data_for_id;
}

function* parseData(action) {
  let data = JSON.parse(action.data);
  let measurement_data = yield select((state) => state.measurement_data)
  let new_measurement_data = new Map(measurement_data);
  for (var i = 0; i < data.length; ++i) {
    let id = data[i].id;
    let measurements = data[i].measurements;
    let data_for_id = new Map();
    if (new_measurement_data.has(id)) {
      data_for_id = new_measurement_data.get(id);
    }
    let new_data_for_id = parseMeasurements(data_for_id, measurements);
    new_measurement_data.set(id, new_data_for_id);
  }
  yield put(dataRecieved(new_measurement_data));
}

function* processDataSaga(action) {
  yield takeEvery(PROCESS_DATA, parseData);
}

export default [
  connectWebsocketSaga,
  processDataSaga
];
