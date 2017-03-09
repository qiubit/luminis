import { createSelector } from 'reselect';
import { fromJS } from 'immutable';

import { selectActiveSubtree, selectTreeStructure, getTreeIdList } from '../App/selectors'


export const selectDataBoxManager = (state) => state.get('DataBoxManager');

export const selectDataboxesRequests = createSelector(
  selectDataBoxManager,
  (globalState) => globalState.get('databoxRequests')
)

export const selectDataboxRequests = createSelector(
  selectDataboxesRequests,
  (databoxesRequests) => (boxId) => databoxesRequests.get(boxId, fromJS({}))
)

export const selectNodeMeasurementRequest = createSelector(
  selectDataboxRequests,
  (getDataboxRequests) => (nodeId, measurementId) => getDataboxRequests(nodeId).get(measurementId, null)
)

export const selectDataTreeIdList = createSelector(
  selectTreeStructure,
  (dataTree) => getTreeIdList(dataTree)
)

export const selectVisibleBoxesIdList = createSelector(
  selectActiveSubtree,
  (activeSubtree) => getTreeIdList(activeSubtree, 1)
)
