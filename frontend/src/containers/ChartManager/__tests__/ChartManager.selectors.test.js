import { Map, fromJS } from 'immutable'

import {
  CHANGE_NODE_TOGGLE,
} from '../constants'
import {
  saveActiveRequestId,
} from '../actions'
import {
  selectActiveRequestId
} from '../selectors'
import reducer from '../reducer'

describe('ChartManager selectors', () => {
  const state = fromJS({
    ChartManager: reducer(undefined, {})
  })

  it('chooses correct activeRequestId global state', () => {
    let newState = state
    newState = newState.set('ChartManager', reducer(newState.get('ChartManager'), saveActiveRequestId(1)))
    expect(selectActiveRequestId(newState)).toBe(1)
  })
})
