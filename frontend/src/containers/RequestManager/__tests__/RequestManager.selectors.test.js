/*
 * Copyright (C) 2017 Paweł Goliński
 * Copyright (C) 2017 Piotr Wiśniewski
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the LICENSE file for details.
 */


import { fromJS } from 'immutable'
import {
  requestNewLiveData,
} from '../actions'
import {
  sendRequest,
} from '../../WebsocketConnection/actions'
import {
  selectRequestManager,
  selectActiveRequestWithId,
} from '../selectors'
import reducer from '../reducer'

describe('RequestManager selectors', () => {
  const state = fromJS({
    RequestManager: reducer(undefined, {})
  })
  it('chooses correct fields from global state', () => {
    let r1 = requestNewLiveData(1, 1)
    let r2 = requestNewLiveData(1, 2)
    const sendR1 = sendRequest(r1.message)
    const sendR2 = sendRequest(r2.message)
    let newState = state
    newState = newState.set('RequestManager', reducer(newState.get('RequestManager'), sendR1))
    newState = newState.set('RequestManager', reducer(newState.get('RequestManager'), sendR2))
    expect(newState.get('RequestManager').get('activeRequests').size).toBe(2)
    newState = newState.setIn(['RequestManager', 'activeRequests', 1, 'testFlag'], 1)
    newState = newState.setIn(['RequestManager', 'activeRequests', 2, 'testFlag'], 2)
    expect(selectRequestManager(newState)).toEqual(newState.get('RequestManager'))
    expect(selectActiveRequestWithId(1)(newState).get('testFlag')).toBe(1)
    expect(selectActiveRequestWithId(2)(newState).get('testFlag')).toBe(2)
  })
})
