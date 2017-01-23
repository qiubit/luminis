import { createSelector } from 'reselect';

const selectMap = () => (state) => state.get('map');

const selectMapTree = () => createSelector(
  selectMap(),
  (mapState) => mapState.get('tree')
);

const selectMapPosition = () => createSelector(
  selectMap(),
  (mapState) => mapState.get('position')
);

export {
  selectMapTree,
  selectMapPosition,
};
