import { createSelector } from 'reselect';
import { fromJS } from 'immutable';

export const selectApp = (state) => state.get('App');

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

export const selectDrawerOpen = createSelector(
  selectApp,
  (globalState) => globalState.get('drawerOpen')
);

export const selectNodesMetadata = createSelector(
  selectApp,
  (globalState) => globalState.get('nodesMetadata')
);

export const selectNodeMetadata = createSelector(
  selectNodesMetadata,
  (nodesMetadata) => (nodeId) => nodesMetadata.get(nodeId, fromJS({}))
);

export const selectNodeName = createSelector(
  selectNodeMetadata,
  (getNodeMetadata) => (nodeId) => getNodeMetadata(nodeId).get('name', '')
);

export const selectNodeMeasurements = createSelector(
  selectNodeMetadata,
  (getNodeMetadata) => (nodeId) => getNodeMetadata(nodeId).get('measurements', fromJS([]))
);

export const selectNodePosition = createSelector(
  selectNodeMetadata,
  (getNodeMetadata) => (nodeId) => getNodeMetadata(nodeId).get('position', fromJS({}))
);

export const selectNodePositionX = createSelector(
  selectNodePosition,
  (getNodePosition) => (nodeId) => getNodePosition(nodeId).get('x', null)
)

export const selectNodePositionY = createSelector(
  selectNodePosition,
  (getNodePosition) => (nodeId) => getNodePosition(nodeId).get('y', null)
)

export const selectTreeStructure = createSelector(
  selectApp,
  (globalState) => globalState.get('treeStructure')
);

export const selectTreeTimestamp = createSelector(
  selectApp,
  (globalState) => globalState.get('treeTimestamp')
);

export const selectMeasurementsMetadata = createSelector(
  selectApp,
  (globalState) => globalState.get('measurementsMetadata')
);

export const selectMeasurementMetadata = createSelector(
  selectMeasurementsMetadata,
  (measurementsMetadata) => (measurementId) => measurementsMetadata.get(measurementId, fromJS({}))
)

export const selectMeasurementName = createSelector(
  selectMeasurementMetadata,
  (getMeasurementMetadata) => (measurementId) => getMeasurementMetadata(measurementId).get('name', '')
)

export const selectActiveNodeId = createSelector(
  selectApp,
  (globalState) => globalState.get('activeNodeId')
);

function getSubTree(tree, subtreeId) {
  if (subtreeId) {
    // Traverse all roots (our data tree is actually a forest)
    for (var i = 0; i < tree.size; i++) {
      // If we found node with given id, we can return a tree rooted at that node
      if (tree.get(i).get('node_id') === subtreeId) {
        return fromJS([tree.get(i)]);
      }
      // Else we try to find node with subtreeId in its children
      var res = getSubTree(tree.get(i).get('children'), subtreeId);
      // If res is nonempty, we don't need to recurse
      // any further, as we have found the subtree
      if (res.size !== 0) {
        return res;
      }
    }
  }
  // Return empty list if we didn't manage to find node with subtreeId
  return fromJS([]);
}

export const createSelectSubtree = (selectSubTreeId) => createSelector(
  selectTreeStructure,
  selectSubTreeId,
  getSubTree
);

export const selectActiveSubtree = createSelectSubtree(selectActiveNodeId);

export function getTreeIdList(tree, maxDepth = -1) {
  let depth = 0;
  let unlimitedDepth = (maxDepth === -1)
  let idList = fromJS([])

  let mapTree = (nodes) => {
    if (unlimitedDepth || depth <= maxDepth) {
      depth += 1
      nodes.forEach((node) => {
        idList = idList.push(node.get('node_id'))
        mapTree(node.get('children'))
      })
    }
  }

  mapTree(tree)
  return idList
}
