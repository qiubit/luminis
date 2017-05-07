/*
 * Copyright (C) 2017 Paweł Goliński
 * Copyright (C) 2017 Piotr Wiśniewski
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the LICENSE file for details.
 */


import { takeEvery, put } from 'redux-saga/effects'

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
