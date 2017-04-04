import { put, takeEvery, call } from 'redux-saga/effects';

import { SEND_REQUEST } from './constants';
import { sendRequestSuccess, sendRequestFail } from './actions'
import { getWebsocket } from './websocket'


function* sendRequest(action) {
  let websocket = getWebsocket()
  const request = action.request
  const requestId = request.request_id
  let errFlag = false

  if (websocket) {
    try {
      websocket.send(JSON.stringify(action.request))
      yield put(sendRequestSuccess(requestId))
    } catch (e) {
      errFlag = true
    }
  } else {
    errFlag = true
  }

  if (errFlag)
    yield put(sendRequestFail(requestId))
}

function* sendRequestSaga(action) {
  yield takeEvery(SEND_REQUEST, sendRequest)
}

export default [
  sendRequestSaga,
];
