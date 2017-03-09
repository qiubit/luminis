import { takeEvery, select, put } from 'redux-saga/effects';

import { selectActiveNodeId } from './selectors'
import { saveActiveNodeId, signalActiveNodeIdChange } from './actions'
import { sendRequest } from '../WebsocketConnection/actions'
import { CHANGE_ACTIVE_NODE_ID, HANDLE_REQUEST } from './constants'

function* changeActiveNodeId(action) {
  let state = yield select();
  let currentActiveNodeId = selectActiveNodeId(state);
  if (currentActiveNodeId !== action.nodeId) {
    yield put(saveActiveNodeId(action.nodeId));
    yield put(signalActiveNodeIdChange(action.nodeId))
  }
}

function* changeActiveNodeIdSaga(action) {
  yield takeEvery(CHANGE_ACTIVE_NODE_ID, changeActiveNodeId)
}

function* handleRequest(action) {
  // for now we don't save any information about requests
  yield put(sendRequest(JSON.stringify(action.message)))
}

function* handleRequestSaga(action) {
  yield takeEvery(HANDLE_REQUEST, handleRequest)
}

export default [
  changeActiveNodeIdSaga,
  handleRequestSaga,
];
