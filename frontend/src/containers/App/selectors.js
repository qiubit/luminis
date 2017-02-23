import { createSelector } from 'reselect';
import { fromJS } from 'immutable';

export const selectApp = (state) => state.get('App');


export const selectDrawerOpen = createSelector(
  selectApp,
  (globalState) => globalState.get('drawerOpen')
);

export const selectLocationState = () => {
  let prevRoutingState;
  let prevRoutingStateJS;

  return (state) => {
    const routingState = state.get('route');

    if (!routingState.equals(prevRoutingState)) {
      prevRoutingState = routingState;
      prevRoutingStateJS = routingState.toJS();
    }

    return prevRoutingStateJS;
  };
};

export const selectDataTree = createSelector(
  selectApp,
  (globalState) => globalState.get('dataTree')
);

export const selectActiveSubtreeRoot = createSelector(
  selectApp,
  (globalState) => globalState.get('activeSubtreeRootId')
);

function getSubTree(dataTree, subtreeId) {
  // Traverse all roots (our data tree is actually a forest)
  for (var i = 0; i < dataTree.size; i++) {
    // If we found node with given id, we can return a tree rooted at that node
    if (dataTree.get(i).get('id') === subtreeId) {
      return fromJS([dataTree.get(i)]);
    }
    // Else we try to find node with subtreeId in its children
    var res = getSubTree(dataTree.get(i).get('children'), subtreeId);
    // If res is nonempty, we don't need to recurse
    // any further, as we have found the subtree
    if (res.size !== 0) {
      return res;
    }
  }
  // Return empty list if we didn't manage to find node with subtreeId
  return fromJS([]);
}

export const createSelectSubtree = (selectSubTreeId) => createSelector(
  selectDataTree,
  selectSubTreeId,
  getSubTree
);

export const selectActiveSubtree = createSelectSubtree(selectActiveSubtreeRoot);

export const selectMeasurementData = createSelector(
  selectApp,
  (globalState) => globalState.get('measurementData')
);

export function getTreeIdList(tree, maxDepth = -1) {
  let depth = 0;
  let unlimitedDepth = (maxDepth ===   -1)
  let idList = fromJS([])

  let mapTree = (nodes) => {
    if (unlimitedDepth || depth <= maxDepth) {
      depth += 1
      nodes.forEach((node) => {
        idList = idList.push(node.get('id'))
        mapTree(node.get('children'))
      })
    }
  }

  mapTree(tree)
  return idList
}
