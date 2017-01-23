import { createSelector } from 'reselect';

const selectGlobal = () => (state) => state.get('global');

const selectDataTree = () => createSelector(
  selectGlobal(),
  (globalState) => globalState.get('dataTree')
);

const selectDrawerOpen = () => createSelector(
  selectGlobal(),
  (globalState) => globalState.get('drawerOpen')
);

const selectLocationState = () => {
  let prevRoutingState;
  let prevRoutingStateJS;

  return (state) => {
    const routingState = state.get('route'); // or state.route

    if (!routingState.equals(prevRoutingState)) {
      prevRoutingState = routingState;
      prevRoutingStateJS = routingState.toJS();
    }

    return prevRoutingStateJS;
  };
};

export {
  selectGlobal,
  selectDataTree,
  selectLocationState,
  selectDrawerOpen,
};
