import { createSelector } from 'reselect';

export const selectNodePage = (state) => state.get('NodePage')

export const selectShownMeasurements = createSelector(
  selectNodePage,
  (nodePageState) => nodePageState.get('measurementIdsShown')
)
