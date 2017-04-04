import { call, takeEvery, put } from 'redux-saga/effects'

import { sendRequest } from '../WebsocketConnection/actions'
import { HANDLE_REQUEST } from './constants'

export function* handleRequest(action) {
  yield put(sendRequest(action.message))
}

// Passes request from component to WebsocketConnection
export function* handleRequestSaga() {
  yield takeEvery(HANDLE_REQUEST, handleRequest)
}

export default [
  handleRequestSaga,
]
