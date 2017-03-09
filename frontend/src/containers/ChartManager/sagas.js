import { takeEvery, select, put } from 'redux-saga/effects';

import { SIGNAL_ACTIVE_NODE_ID_CHANGE } from '../App/constants'
import { selectActiveRequestId } from './selectors'
import { requestNewChart, cancelRequest } from '../App/actions'
import { saveActiveRequestId } from './actions'


function* updateActiveRequestId(action) {
  let state = yield select();
  let activeRequestId = selectActiveRequestId(state);
  if (activeRequestId) {
    yield put(cancelRequest(activeRequestId));
  }
  let requestAction = requestNewChart();
  let newRequestId = requestAction.message.request_id;
  yield put(requestAction);
  yield put(saveActiveRequestId(newRequestId))
}

function* updateActiveRequestIdSaga(action) {
  yield takeEvery(SIGNAL_ACTIVE_NODE_ID_CHANGE, updateActiveRequestId)
}

export default [
  updateActiveRequestIdSaga,
];
