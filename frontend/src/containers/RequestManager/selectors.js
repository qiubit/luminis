/*
 * Copyright (C) 2017 Paweł Goliński
 * Copyright (C) 2017 Piotr Wiśniewski
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the LICENSE file for details.
 */


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
