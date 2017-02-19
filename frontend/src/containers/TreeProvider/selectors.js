import { createSelector } from 'reselect';

export const selectTreeProvider = (state) => state.get('TreeProvider');

export const selectDataTree = createSelector(
  selectTreeProvider,
  (globalState) => globalState.get('dataTree')
);
