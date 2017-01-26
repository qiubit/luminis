import { throttle, put, takeEvery, select } from 'redux-saga/effects';
import { CONNECT_WEBSOCKET, PROCESS_DATA } from './constants';
import { saveWebsocket, dataRecieved } from './actions';
import { getNodeMeasurements, getNamedMeasurements } from './parsers';
import { selectMeasurementData } from './selectors';
import { insertToSortedArray } from './utils';
import { fromJS } from 'immutable';


function mergeMeasurements(appNodeMeasurements, websocketNodeMeasurements) {
  for (var i = 0; i < websocketNodeMeasurements.length; ++i) {
    let dataPoint = fromJS(websocketNodeMeasurements[i]);
    let timeseries = getNamedMeasurements(appNodeMeasurements, dataPoint.get('name'));
    timeseries = insertToSortedArray((point) => (dataPoint.get('timestamp') > point.get('timestamp')), timeseries, dataPoint);
    if (timeseries.size > 10) {
      // length is at most 11 so shift is enough
      timeseries = timeseries.shift();
    }
    appNodeMeasurements = appNodeMeasurements.set(dataPoint.get('name'), timeseries);
  }
  return appNodeMeasurements;
}

// Merges incoming websocket measurement data with app measurement data.

// Websocket measurement data format:
//
// [
//   {
//     "id": 2,
//     "measurements": [
//       {
//         "name": "measurement1",
//         "value": 0.1,
//         "time": 1485378697,
//       },
//       {
//         "name": "measurement2",
//         "value": 10,
//         "time": 1485378690,
//       },
//       ...
//     ]
//   },
//   ...
// ]

// Our app's measurement data format:
// {
//   2: {
//     "measurement1": [{
//       "name": "measurement1",
//       "value": 0.1,
//       "time": 1485378697,
//     },...],
//     "measurement2": [{
//       "name": "measurement2",
//       "value": 10,
//       "time": 1485378690,
//     },...],
//     ...
//   },
//   ...
// }

function mergeMeasurementData(appMeasurementData, websocketMeasurementData) {
  for (var i = 0; i < websocketMeasurementData.length; ++i) {
    let nodeId = websocketMeasurementData[i].id;
    let nodeMeasurements = websocketMeasurementData[i].measurements;
    let appNodeMeasurements = getNodeMeasurements(appMeasurementData, nodeId);
    let newNodeMeasurements = mergeMeasurements(appNodeMeasurements, nodeMeasurements);
    appMeasurementData = appMeasurementData.set(nodeId, newNodeMeasurements);
  }
  return appMeasurementData;
}

function* processData(action) {
  let currentMeasurementData = yield select(selectMeasurementData);
  let websocketMeasurementData = JSON.parse(action.data);
  let newMeasurementData = mergeMeasurementData(currentMeasurementData, websocketMeasurementData);
  yield put(dataRecieved(newMeasurementData));
}

function* connectWebsocket(action) {
  let websocket = new WebSocket(action.url);
  websocket.onopen = action.websocketOnOpen;
  websocket.onmessage = action.websocketOnMessage;
  websocket.onclose = action.websocketOnClose;
  yield put(saveWebsocket(websocket));
}

function* processDataSaga(action) {
  yield takeEvery(PROCESS_DATA, processData);
}

function* connectWebsocketSaga(action) {
  yield throttle(10000, CONNECT_WEBSOCKET, connectWebsocket);
}

export default [
  processDataSaga,
  connectWebsocketSaga,
];
