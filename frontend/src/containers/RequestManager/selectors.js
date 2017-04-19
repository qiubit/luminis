import { createSelector } from 'reselect';

export const selectRequestManager = (state) => state.get('RequestManager');

export const selectActiveRequests = createSelector(
  selectRequestManager,
  (requestManagerState) => requestManagerState.get('activeRequests')
)

export const selectActiveRequestWithId = (requestId) => createSelector(
  selectActiveRequests,
  (activeRequests) => activeRequests.get(requestId)
)
