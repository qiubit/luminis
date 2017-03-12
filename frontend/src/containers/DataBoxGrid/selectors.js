import { createSelector } from 'reselect';

import { selectDataTreeIdList, selectVisibleBoxesIdList } from '../DataBoxManager/selectors'

// See docs of AbsoluteGrid why we're preparing list of all ids in tree
// "key" and "filtered" are props used by AbsoluteGrid
function createDataBoxesParams(dataTreeIdList, visibleBoxesIdList) {
  let dataBoxesParams = dataTreeIdList.map(nodeId =>
    Object({
      key: nodeId,
      nodeId,
      filtered: !visibleBoxesIdList.includes(nodeId)
    })
  );
  return dataBoxesParams.toJS();
}

export const selectDataBoxes = createSelector(
  selectDataTreeIdList,
  selectVisibleBoxesIdList,
  (dataTreeIdList, visibleBoxesIdList) => createDataBoxesParams(dataTreeIdList, visibleBoxesIdList)
)
