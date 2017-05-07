/*
 * Copyright (C) 2017 Paweł Goliński
 * Copyright (C) 2017 Piotr Wiśniewski
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the LICENSE file for details.
 */


import { createSelector } from 'reselect'

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
  )
  return dataBoxesParams.toJS()
}

export const selectDataBoxes = createSelector(
  selectDataTreeIdList,
  selectVisibleBoxesIdList,
  (dataTreeIdList, visibleBoxesIdList) => createDataBoxesParams(dataTreeIdList, visibleBoxesIdList)
)
