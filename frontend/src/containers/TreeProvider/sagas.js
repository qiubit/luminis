/*
 * Copyright (C) 2017 Paweł Goliński
 * Copyright (C) 2017 Piotr Wiśniewski
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the LICENSE file for details.
 */


import 'whatwg-fetch'
import { fromJS } from 'immutable'
import { put, throttle, select } from 'redux-saga/effects'

import { DOWNLOAD_TREE } from './constants'
import { saveTree } from '../App/actions'
import { selectTreeTimestamp } from '../App/selectors'


function* downloadTree(action) {
  const timestampJson = yield fetch(action.timestampUrl)
    .then((response) => {
      return response.json()
    })
    .catch((error) => {
      console.log('error in download timestamp')
      console.log(error)
      return []
    })
  const savedTimestamp = yield select(selectTreeTimestamp)
  const currentTimestamp = timestampJson.timestamp
  if (savedTimestamp !== currentTimestamp) {
    let newTree = yield fetch(action.treeUrl)
      .then((response) => {
        return response.json()
      })
      .catch((error) => {
        console.log('error in download tree')
        console.log(error)
        return []
      })
    newTree = fromJS(newTree)
    if (newTree.size > 0) {
      yield put(saveTree(currentTimestamp, newTree))
    }
  }
}

function* downloadTreeSaga(action) {
  yield throttle(10 * 1000, DOWNLOAD_TREE, downloadTree)
}

export default [
  downloadTreeSaga
]
