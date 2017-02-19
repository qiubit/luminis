import { put, throttle } from 'redux-saga/effects'
import { DOWNLOAD_TREE } from './constants';
import { saveTree } from './actions';
import { updateTreeListToggle } from '../TreeList/actions'
import { fromJS } from 'immutable';
import 'whatwg-fetch';

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
  if (newTree.length > 0) {
    yield put(saveTree(fromJS(newTree)));
    yield put(updateTreeListToggle(fromJS(newTree)));
  }
}

function* downloadTreeSaga(action) {
  yield throttle(10 * 1000, DOWNLOAD_TREE, downloadTree);
}

export default [
  downloadTreeSaga
];
