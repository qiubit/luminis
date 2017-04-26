import {
  HANDLE_REQUEST,
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

export function requestNewChart(nodeId, measurementIds, beginTs, endTs, updateData, aggregationLength, aggregationType) {
  let requestId = getNextRequestId();
  let message = {
    request_id: requestId,
    type: 'new_chart',
    params: {
      node_id: nodeId,
      requested_data: measurementIds,
      begin_ts: beginTs,
      end_ts: endTs,
      update_data: updateData,
      aggregation_length: aggregationLength,
      aggregation_type: aggregationType
    },
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
