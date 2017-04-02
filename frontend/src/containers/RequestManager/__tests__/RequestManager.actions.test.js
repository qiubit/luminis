import { Set } from 'immutable'
import {
  requestNewLiveData,
  requestNewChart,
  cancelRequest,
} from '../actions'
import { HANDLE_REQUEST } from '../constants'

describe('RequestManager actions', () => {
  it('requestNewLiveData is consistent with protocol specification', () => {
    const newLiveDataRequest = requestNewLiveData(1, 2)
    const protocolNewLiveDataRequest = {
      request_id: 1,
      type: "new_live_data",
      params: {
        node_id: 1,
        measurement_id: 2,
      },
    }

    expect(newLiveDataRequest.type).toEqual(HANDLE_REQUEST)
    expect(newLiveDataRequest.message.type).toEqual(protocolNewLiveDataRequest.type)
    expect(newLiveDataRequest.message.params).toEqual(protocolNewLiveDataRequest.params)
    expect(typeof newLiveDataRequest.message.request_id).toBe('number')
  })

  it('requestNewChart is consistent with protocol specification', () => {
    const chartParams = {
      node_id: 1,
      begin_ts: 1490989996,
      end_ts: 1490989999,
      requested_data: {
        measurement_id: 2,
      },
      update_data: false,
      aggregation_length: 1,
      aggregation_type: "mean",
    }

    const newChartRequest = requestNewChart(chartParams)
    const protocolNewChartRequest = {
      request_id: 1,
      type: "new_chart",
      params: chartParams,
    }

    expect(newChartRequest.type).toEqual(HANDLE_REQUEST)
    expect(newChartRequest.message.type).toEqual(protocolNewChartRequest.type)
    expect(newChartRequest.message.params).toEqual(protocolNewChartRequest.params)
    expect(typeof newChartRequest.message.request_id).toBe('number')
  })

  it('cancelRequest is consistent with protocol specification', () => {
    const cancelRequestAction = cancelRequest(42)
    const protocolCancelRequest = {
      request_id: null,
      type: "cancel_request",
      params: {
        request_id: 42,
      }
    }

    expect(cancelRequestAction.type).toEqual(HANDLE_REQUEST)
    expect(cancelRequestAction.message).toEqual(protocolCancelRequest)
  })

  it('all requests have unique id', () => {
    const r1 = requestNewLiveData(1, 2)
    const r2 = requestNewLiveData(1, 2)
    const r3 = requestNewLiveData(2, 3)
    const r4 = requestNewChart({})
    let requestIds = new Set()

    requestIds = requestIds.add(r1.message.request_id)
    requestIds = requestIds.add(r2.message.request_id)
    requestIds = requestIds.add(r3.message.request_id)
    requestIds = requestIds.add(r4.message.request_id)

    expect(requestIds.size).toBe(4)
  })
})
