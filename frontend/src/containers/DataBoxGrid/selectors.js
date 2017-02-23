import { createSelector } from 'reselect';

import { selectActiveSubtree, selectDataTree, getTreeIdList } from '../App/selectors'

// See docs of AbsoluteGrid why we're preparing list of all ids in tree
// "key" and "filtered" are props used by AbsoluteGrid
function createDataBoxesParams(dataTreeIdList, visibleBoxesIdList) {
  let dataBoxesParams = dataTreeIdList.map(id => Object({key: id, id: id, filtered: !visibleBoxesIdList.includes(id)}));
  return dataBoxesParams.toJS();
}

export const selectDataTreeIdList = createSelector(
  selectDataTree,
  (dataTree) => getTreeIdList(dataTree)
)

export const selectVisibleBoxesIdList = createSelector(
  selectActiveSubtree,
  (activeSubtree) => getTreeIdList(activeSubtree, 1)
)

export const selectDataBoxes = createSelector(
  selectDataTreeIdList,
  selectVisibleBoxesIdList,
  (dataTreeIdList, visibleBoxesIdList) => createDataBoxesParams(dataTreeIdList, visibleBoxesIdList)
)
