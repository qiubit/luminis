/*
 * Copyright (C) 2017 Paweł Goliński
 * Copyright (C) 2017 Piotr Wiśniewski
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the LICENSE file for details.
 */


import {
  DRAWER_TOGGLE,
  DRAWER_CHANGE,
  CHANGE_ACTIVE_NODE_ID,
  SAVE_METADATA,
  SAVE_ACTIVE_NODE_ID,
  SIGNAL_ACTIVE_NODE_ID_CHANGE,
  HANDLE_REQUEST
} from './constants'

export function drawerToggle() {
  return {
    type: DRAWER_TOGGLE,
  }
}

export function drawerChange(drawerOpen) {
  return {
    type: DRAWER_CHANGE,
    drawerOpen,
  }
}

export function saveTree(dataTimestamp, dataTree) {
  return {
    type: SAVE_METADATA,
    dataTimestamp,
    dataTree,
  }
}

export function changeActiveNodeId(nodeId) {
  return {
    type: CHANGE_ACTIVE_NODE_ID,
    nodeId,
  }
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

function getNextRequestId() {
  if (typeof getNextRequestId.nextId === 'undefined') {
    getNextRequestId.nextId = 1
  }
  return (getNextRequestId.nextId++)
}

export function requestNewLiveData(nodeId, measurementId) {
  let requestId = getNextRequestId()
  let message = {
    request_id: requestId,
    type: 'new_live_data',
    params: {
      node_id: nodeId,
      measurement_id: measurementId
    }
  }
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
  }
  return {
    type: HANDLE_REQUEST,
    message
  }
}

export function requestNewChart() {
  let requestId = getNextRequestId()
  let message = {
    request_id: requestId,
    type: 'new_chart',
    params: {}
  }
  return {
    type: HANDLE_REQUEST,
    message
  }
}
