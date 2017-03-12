import { fromJS } from 'immutable';

import {
  DRAWER_TOGGLE,
  DRAWER_CHANGE,
  SAVE_ACTIVE_NODE_ID,
  SAVE_METADATA,
  SAVE_MEASUREMENTDATA
} from './constants';


// The initial state of the App
const initialState = fromJS({
  drawerOpen: false,
  activeNodeId: null,
  nodesMetadata: {},
  treeStructure: [],
  measurementsMetadata: {},
  requestedData: {},
});

function updateRequestedData(currentData, newData) {
  let updatedData = currentData;
  newData.forEach((data) =>{
    let newValue = fromJS({
      type: data.get('type'),
      data: data.get('data')
    });
    updatedData = updatedData.set(data.get('request_id'), newValue);
  });
  return updatedData;
}


function appReducer(state = initialState, action) {
  switch (action.type) {
    case DRAWER_TOGGLE:
      return state
        .set('drawerOpen', !state.get('drawerOpen'));
    case DRAWER_CHANGE:
      return state
        .set('drawerOpen', action.drawerOpen);
    case SAVE_ACTIVE_NODE_ID:
      return state
        .set('activeNodeId', action.nodeId);
    case SAVE_METADATA:
      return state
        .set('nodesMetadata', action.dataTree.get('tree_metadata'))
        .set('treeStructure', action.dataTree.get('tree'))
        .set('measurementsMetadata', action.dataTree.get('measurements_metadata'));
    case SAVE_MEASUREMENTDATA:
      let updatedRequestedData = updateRequestedData(state.get('requestedData'), action.requestedData)
      return state
        .set('requestedData', updatedRequestedData);
    default:
      return state;
  }
}

export default appReducer;
