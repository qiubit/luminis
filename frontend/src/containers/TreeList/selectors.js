import { createSelector } from 'reselect';

export const selectTreeList = (state) => state.get('TreeList');

export const selectTreeListToggle = createSelector(
  selectTreeList,
  (globalState) => globalState.get('treeListToggle')
);
