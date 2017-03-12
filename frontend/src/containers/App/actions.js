import {
  DRAWER_TOGGLE,
  DRAWER_CHANGE,
  CHANGE_ACTIVE_NODE_ID,
  SAVE_METADATA,
  SAVE_MEASUREMENTDATA,
  SAVE_ACTIVE_NODE_ID,
  SIGNAL_ACTIVE_NODE_ID_CHANGE,
  HANDLE_REQUEST
} from './constants';

export function drawerToggle() {
  return {
    type: DRAWER_TOGGLE,
  };
}

export function drawerChange(drawerOpen) {
  return {
    type: DRAWER_CHANGE,
    drawerOpen,
  };
}

export function saveTree(dataTree) {
  return {
    type: SAVE_METADATA,
    dataTree,
  };
}

export function changeActiveNodeId(nodeId) {
  return {
    type: CHANGE_ACTIVE_NODE_ID,
    nodeId,
  };
}

export function saveActiveNodeId(nodeId) {
  return {
    type: SAVE_ACTIVE_NODE_ID,
    nodeId
  }
}

export function signalActiveNodeIdChange(nodeId) {
  return {
    type: SIGNAL_ACTIVE_NODE_ID_CHANGE,
    nodeId
  }
}

export function saveData(requestedData) {
  return {
    type: SAVE_MEASUREMENTDATA,
    requestedData,
  }
}

function getNextRequestId() {
  if (typeof getNextRequestId.nextId === 'undefined') {
    getNextRequestId.nextId = 1;
  }
  return (getNextRequestId.nextId++)
}

export function requestNewLiveData(nodeId, measurementId) {
  let requestId = getNextRequestId();
  let message = {
    request_id: requestId,
    type: 'new_live_data',
    params: {
      node_id: nodeId,
      measurement_id: measurementId
    }
  };
  return {
    type: HANDLE_REQUEST,
    message
  }
}

export function cancelRequest(requestId) {
  let message = {
    request_id: 0,
    type: 'cancel_request',
    params: {
      request_id: requestId
    }
  };
  return {
    type: HANDLE_REQUEST,
    message
  }
}

export function requestNewChart() {
  let requestId = getNextRequestId();
  let message = {
    request_id: requestId,
    type: 'new_chart',
    params: {}
  };
  return {
    type: HANDLE_REQUEST,
    message
  }
}
