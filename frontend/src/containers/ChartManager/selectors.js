import { createSelector } from 'reselect';

export const selectChartManager = (state) => state.get('ChartManager');

export const selectActiveRequestId = createSelector(
  selectChartManager,
  (globalState) => globalState.get('activeRequestId')
)
