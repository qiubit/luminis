import { call, takeEvery, put } from 'redux-saga/effects'

import {
  handleRequestSaga,
  handleRequest,
} from '../sagas'
import {
  requestNewLiveData,
  requestNewChart,
  cancelRequest
} from '../actions'
import {
  HANDLE_REQUEST,
} from '../constants'
import { sendRequest } from '../../WebsocketConnection/actions'

describe('RequestManager sagas', () => {
  it('requestNewLiveData is passed to WebsocketConnection', () => {
    const newLiveDataRequest = requestNewLiveData(1, 2)
    const generatorParent = handleRequestSaga()
    const generatorChild = handleRequest(newLiveDataRequest)

    // handleRequest will be called on HANDLE_REQUEST action type
    expect(generatorParent.next().value).toEqual(call(takeEvery, HANDLE_REQUEST, handleRequest))
    // so newLiveDataRequest will trigger saga call
    expect(newLiveDataRequest.type).toBe(HANDLE_REQUEST)
    // and then we expect saga to dispatch the action to store
    expect(generatorChild.next().value).toEqual(put(sendRequest(newLiveDataRequest.message)))
    // after which the saga should finish its execution
    expect(generatorChild.next().done).toBeTruthy()
  })

  it('requestNewChart is passed to WebsocketConnection', () => {
    const newChartRequest = requestNewChart({})
    const generatorParent = handleRequestSaga()
    const generatorChild = handleRequest(newChartRequest)

    expect(generatorParent.next().value).toEqual(call(takeEvery, HANDLE_REQUEST, handleRequest))
    expect(newChartRequest.type).toBe(HANDLE_REQUEST)
    expect(generatorChild.next().value).toEqual(put(sendRequest(newChartRequest.message)))
    expect(generatorChild.next().done).toBeTruthy()
  })

  it('cancelRequest is passed to WebsocketConnection', () => {
    const cancelRequestAction = cancelRequest(1)
    const generatorParent = handleRequestSaga()
    const generatorChild = handleRequest(cancelRequestAction)

    expect(generatorParent.next().value).toEqual(call(takeEvery, HANDLE_REQUEST, handleRequest))
    expect(cancelRequestAction.type).toBe(HANDLE_REQUEST)
    expect(generatorChild.next().value).toEqual(put(sendRequest(cancelRequestAction.message)))
    expect(generatorChild.next().done).toBeTruthy()
  })
})
