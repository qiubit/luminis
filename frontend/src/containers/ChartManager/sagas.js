/*
 * Copyright (C) 2017 Paweł Goliński
 * Copyright (C) 2017 Piotr Wiśniewski
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the LICENSE file for details.
 */


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
