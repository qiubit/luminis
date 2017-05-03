import { Map } from 'immutable'

import {
  HANDLE_REQUESTS,
  PENDING_STATE,
  FRESH_STATE,
  STALE_STATE,
} from '../constants'
import {
  sendRequest,
  messageFromServer,
  websocketDisconnected,
  sendRequestFail,
} from '../../WebsocketConnection/actions'
import {
  requestNewLiveData,
  requestNewChart,
  cancelRequest,
} from '../actions'
import reducer from '../reducer'

describe('RequestManager reducer', () => {

  // Some constants used by more than 1 test
  const initialState = reducer(undefined, {})
  const message1Request = {
    request_id: 1,
    type: 'new_live_data',
    params: {
      node_id: 1,
      measurement_id: 1,
    },
  }
  const message1 = {
    request_id: 1,
    type: "new_live_data",
    data: {
      value: 42.01,
      timestamp: 1490610672,
    },
  }
  const message2Request = {
    request_id: 2,
    type: 'new_live_data',
    params: {
      node_id: 2,
      measurement_id: 2,
    },
  }
  const message2 = {
    request_id: 2,
    type: "new_live_data",
    data: {
      value: 43.01,
      timestamp: 1490610695,
    },
  }

  it('returns correct initial state', () => {
    expect(initialState.size).toBe(1)
    expect(initialState.get('activeRequests').size).toBe(0)
  })

  it('drops incoming request messages from requests that we do not subscribe', () => {
    const action1 = messageFromServer(message1)

    const state1 = reducer(initialState, action1)
    expect(state1.size).toBe(1)
    // request 1 was not in PENDING state, so we're not expecting any messages
    expect(state1.get('activeRequests').size).toBe(0)

  })

  it('changes request state to PENDING_STATE on sending message to WebSocket', () => {
    const sendMessage1Request = sendRequest(message1Request)
    let state = reducer(initialState, sendMessage1Request)
    expect(state.size).toBe(1)
    expect(state.get('activeRequests').size).toBe(1)
    expect(state.get('activeRequests').get(1).size).toBe(1)
    expect(state.get('activeRequests').get(1).get('state')).toBe(PENDING_STATE)
    const sendMessage2Request = sendRequest(message2Request)
    state = reducer(state, sendMessage2Request)
    expect(state.size).toBe(1)
    expect(state.get('activeRequests').size).toBe(2)
    expect(state.get('activeRequests').get(1).size).toBe(1)
    expect(state.get('activeRequests').get(1).get('state')).toBe(PENDING_STATE)
    expect(state.get('activeRequests').get(2).size).toBe(1)
    expect(state.get('activeRequests').get(2).get('state')).toBe(PENDING_STATE)
  })

  it('saves incoming data for PENDING_STATE requests', () => {
    const sendMessage1Request = sendRequest(message1Request)
    let state = reducer(initialState, sendMessage1Request)
    const messageFromServer1 = messageFromServer(message1)
    state = reducer(state, messageFromServer1)
    expect(state.size).toBe(1)
    expect(state.get('activeRequests').size).toBe(1)
    // message1 data and type field + one RequestManager field for saving "staleness"
    expect(state.get('activeRequests').get(1).size).toBe(3)
    expect(state.get('activeRequests').get(1).get('state')).toBe(FRESH_STATE)
    expect(state.get('activeRequests').get(1).get('data')).toEqual(message1.data)
    expect(state.get('activeRequests').get(1).get('type')).toBe(message1.type)
    const sendMessage2Request = sendRequest(message2Request)
    state = reducer(state, sendMessage2Request)
    expect(state.get('activeRequests').size).toBe(2)
    const messageFromServer2 = messageFromServer(message2)
    state = reducer(state, messageFromServer2)
    expect(state.get('activeRequests').size).toBe(2)
    expect(state.get('activeRequests').get(1).size).toBe(3)
    expect(state.get('activeRequests').get(1).get('state')).toBe(FRESH_STATE)
    expect(state.get('activeRequests').get(1).get('data')).toEqual(message1.data)
    expect(state.get('activeRequests').get(1).get('type')).toBe(message1.type)
    expect(state.get('activeRequests').get(2).size).toBe(3)
    expect(state.get('activeRequests').get(2).get('state')).toBe(FRESH_STATE)
    expect(state.get('activeRequests').get(2).get('data')).toEqual(message2.data)
    expect(state.get('activeRequests').get(2).get('type')).toBe(message2.type)
  })

  it('updates subscribed requests on new data', () => {
    const sendMessage1Request = sendRequest(message1Request)
    let state = reducer(initialState, sendMessage1Request)
    const messageFromServer1 = messageFromServer(message1)
    state = reducer(state, messageFromServer1)

    let newMessage1 = Object.assign({}, message1)
    newMessage1.data = {value: 3.1415, timestamp: newMessage1.data.timestamp}
    const requestNewMessage1 = messageFromServer(newMessage1)
    state = reducer(state, requestNewMessage1)
    expect(state.size).toBe(1)
    expect(state.get('activeRequests').size).toBe(1)
    expect(state.get('activeRequests').get(1).size).toBe(3)
    expect(state.get('activeRequests').get(1).get('state')).toBe(FRESH_STATE)
    expect(state.get('activeRequests').get(1).get('data')).not.toEqual(message1.data)
    expect(state.get('activeRequests').get(1).get('data')).toEqual(newMessage1.data)
    expect(state.get('activeRequests').get(1).get('type')).toBe(newMessage1.type)
  })

  it('drops PENDING_STATE requests on WebSocket disconnection', () => {
    const sendMessage1Request = sendRequest(message1Request)
    let state = reducer(initialState, sendMessage1Request)
    expect(state.get('activeRequests').get(1).size).toBe(1)
    expect(state.get('activeRequests').get(1).get('state')).toBe(PENDING_STATE)
    state = reducer(state, websocketDisconnected())
    expect(state.get('activeRequests').size).toBe(0)
  })

  it('makes FRESH_STATE requests into STALE_STATE requests on WebSocket disconnection', () => {
    const sendMessage1Request = sendRequest(message1Request)
    let state = reducer(initialState, sendMessage1Request)
    expect(state.get('activeRequests').size).toBe(1)
    expect(state.get('activeRequests').get(1).get('state')).toBe(PENDING_STATE)
    const messageFromServer1 = messageFromServer(message1)
    state = reducer(state, messageFromServer1)
    expect(state.get('activeRequests').size).toBe(1)
    expect(state.get('activeRequests').get(1).get('state')).toBe(FRESH_STATE)
    state = reducer(state, websocketDisconnected())
    expect(state.get('activeRequests').size).toBe(1)
    expect(state.get('activeRequests').get(1).get('state')).toBe(STALE_STATE)
  })

  it('drops PENDING_STATE requests and makes other requests into STALE_STATE on WebSocket disconnection', () => {
    const sendMessage1Request = sendRequest(message1Request)
    let state = reducer(initialState, sendMessage1Request)
    const messageFromServer1 = messageFromServer(message1)
    state = reducer(state, messageFromServer1)
    const sendMessage2Request = sendRequest(message2Request)
    state = reducer(state, sendMessage2Request)
    expect(state.get('activeRequests').size).toBe(2)
    expect(state.get('activeRequests').get(1).get('state')).toBe(FRESH_STATE)
    expect(state.get('activeRequests').get(2).get('state')).toBe(PENDING_STATE)
    state = reducer(state, websocketDisconnected())
    expect(state.get('activeRequests').size).toBe(1)
    expect(state.get('activeRequests').get(1).get('state')).toBe(STALE_STATE)
  })

  it('drops requests on after cancelRequest action', () => {
    const sendMessage1Request = sendRequest(message1Request)
    const sendMessage2Request = sendRequest(message2Request)
    let state = reducer(initialState, sendMessage1Request)
    state = reducer(state, sendMessage2Request)
    expect(state.get('activeRequests').size).toBe(2)
    expect(state.get('activeRequests').get(1).get('state')).toBe(PENDING_STATE)
    expect(state.get('activeRequests').get(2).get('state')).toBe(PENDING_STATE)
    const cancelRequestAction = cancelRequest(1)
    state = reducer(state, cancelRequestAction)
    expect(state.get('activeRequests').size).toBe(1)
    expect(state.get('activeRequests').get(2).get('state')).toBe(PENDING_STATE)
  })

  it('does not subscribe to null requests on cancelRequest', () => {
    const cancelRequestAction = cancelRequest(1)
    let state = reducer(initialState, cancelRequestAction)
    expect(state.get('activeRequests').size).toBe(0)
    const sendCancelRequest = sendRequest(cancelRequestAction)
    state = reducer(state, sendCancelRequest)
    expect(state.get('activeRequests').size).toBe(0)
  })

  it('drops requests on SEND_REQUEST_FAIL from WebSocket', () => {
    const sendMessage1Request = sendRequest(message1Request)
    const sendMessage2Request = sendRequest(message2Request)
    let state = reducer(initialState, sendMessage1Request)
    state = reducer(state, sendMessage2Request)
    expect(state.get('activeRequests').size).toBe(2)
    expect(state.get('activeRequests').get(1).get('state')).toBe(PENDING_STATE)
    expect(state.get('activeRequests').get(2).get('state')).toBe(PENDING_STATE)
    const sendRequest1Fail = sendRequestFail(1)
    state = reducer(state, sendRequest1Fail)
    expect(state.get('activeRequests').size).toBe(1)
    expect(state.get('activeRequests').get(2).get('state')).toBe(PENDING_STATE)
  })

  // saga handles them
  it('ignores HANDLE_REQUEST actions of type other than "cancel_request"', () => {
    const sendMessage1Request = sendRequest(message1Request)
    const sendMessage2Request = sendRequest(message2Request)
    let state = reducer(initialState, sendMessage1Request)
    state = reducer(state, sendMessage2Request)
    expect(state.get('activeRequests').size).toBe(2)
    expect(state.get('activeRequests').get(1).get('state')).toBe(PENDING_STATE)
    expect(state.get('activeRequests').get(2).get('state')).toBe(PENDING_STATE)
    let newState = reducer(state, requestNewLiveData(1, 1))
    newState = reducer(newState, requestNewChart({}))
    expect(state).toEqual(newState)
  })
})
