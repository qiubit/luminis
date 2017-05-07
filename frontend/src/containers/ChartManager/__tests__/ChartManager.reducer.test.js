import { Map, List } from 'immutable'

import {
  saveActiveRequestId,
} from '../actions'
import reducer from '../reducer'

describe('TreeList reducer', () => {
  const initialState = reducer(undefined, {})

  it('returns correct initial state', () => {
    expect(initialState.size).toBe(1)
    expect(initialState.get('activeRequestId')).toBe(null)
  })

  it('changes activeRequestId correctly', () => {
    let state = reducer(initialState, saveActiveRequestId(1))
    expect(state.size).toBe(1)
    expect(state.get('activeRequestId')).toBe(1)
  })
})
