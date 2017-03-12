import { takeEvery, select, put } from 'redux-saga/effects';

import { SIGNAL_ACTIVE_NODE_ID_CHANGE } from '../App/constants'
import { saveDataBoxRequests } from './actions'
import { requestNewLiveData, cancelRequest } from '../App/actions'
import { selectNodeMeasurements } from '../App/selectors'
import { selectVisibleBoxesIdList, selectDataboxesRequests, selectNodeMeasurementRequest } from './selectors'


function* updateDataboxRequests(action) {
  let state = yield select();
  let getNodeMeasurements = selectNodeMeasurements(state);
  let visibleBoxesIdList = selectVisibleBoxesIdList(state);
  let getNodeMeasurementRequest = selectNodeMeasurementRequest(state)
  let databoxRequests = selectDataboxesRequests(state);
  let newDataBoxRequests = databoxRequests;

  // request new data
  for (let nodeId of visibleBoxesIdList) {
    let nodeMeasurements = getNodeMeasurements(nodeId.toString());
    for (let measurementId of nodeMeasurements) {
      if (getNodeMeasurementRequest(nodeId.toString(), measurementId.toString()) == null) {
        let action = requestNewLiveData(nodeId, measurementId);
        let requestId = action.message.request_id;
        newDataBoxRequests = newDataBoxRequests.setIn([nodeId.toString(), measurementId.toString()], requestId)
        yield put(action);
      }
    }
  }

  // cancel data
  for (let nodeId of databoxRequests.keySeq()) {
    if (!visibleBoxesIdList.includes(parseInt(nodeId, 10))) {
      for (let measurementId of databoxRequests.get(nodeId).keySeq()) {
        let action = cancelRequest(databoxRequests.get(nodeId).get(measurementId))
        yield put(action);
      }
      newDataBoxRequests = newDataBoxRequests.deleteIn(nodeId)
    }
  }

  yield put(saveDataBoxRequests(newDataBoxRequests));
}

function* updateDataboxRequestsSaga(action) {
  yield takeEvery(SIGNAL_ACTIVE_NODE_ID_CHANGE, updateDataboxRequests)
}

export default [
  updateDataboxRequestsSaga,
];
