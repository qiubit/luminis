import { createSelector } from 'reselect';

import { createSelectSubtree } from '../App/selectors';

export const selectMapPage = (state) => state.get('MapPage');

export const selectActiveSubtreeRoot = createSelector(
  selectMapPage,
  (mapState) => mapState.get('activeSubtreeRoot')
);

export const selectActiveSubtree = createSelectSubtree(selectActiveSubtreeRoot);
