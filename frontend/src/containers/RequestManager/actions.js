import {
  HANDLE_REQUEST,
  CANCEL_REQUEST,
} from './constants'

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
      measurement_id: measurementId,
    }
  }
  return {
    type: HANDLE_REQUEST,
    message,
  }
}

export function requestNewChart(params) {
  let requestId = getNextRequestId();
  let message = {
    request_id: requestId,
    type: 'new_chart',
    params,
  }
  return {
    type: HANDLE_REQUEST,
    message,
  }
}

export function cancelRequest(requestId) {
  let message = {
    request_id: null,
    type: 'cancel_request',
    params: {
      request_id: requestId,
    },
  }
  return {
    type: HANDLE_REQUEST,
    message,
  }
}
