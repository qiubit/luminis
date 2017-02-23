import 'whatwg-fetch';
import { fromJS } from 'immutable';
import { put, throttle } from 'redux-saga/effects'

import { DOWNLOAD_TREE } from './constants';
import treeListeners from './listeners'

function* downloadTree(action) {
  let newTree = [];
  console.log('downloading tree');
  newTree = yield fetch(action.url)
    .then((response) => {
      return response.json();
    })
    .catch((error) => {
      console.log('error in download');
      console.log(error);
      return [];
    });
  newTree = fromJS(newTree)
  if (newTree.size > 0) {
    for (let listener of treeListeners) {
      yield put(listener(newTree))
    }
  }
}

function* downloadTreeSaga(action) {
  yield throttle(10 * 1000, DOWNLOAD_TREE, downloadTree);
}

export default [
  downloadTreeSaga
];
