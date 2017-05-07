/*
 * Copyright (C) 2017 Paweł Goliński
 * Copyright (C) 2017 Piotr Wiśniewski
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the LICENSE file for details.
 */


import { createSelector } from 'reselect'

export const selectChartManager = (state) => state.get('ChartManager')

export const selectActiveRequestId = createSelector(
  selectChartManager,
  (globalState) => globalState.get('activeRequestId')
)
