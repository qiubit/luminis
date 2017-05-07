import { Map, List } from 'immutable'

import {
  CHANGE_NODE_TOGGLE,
} from '../constants'
import {
  changeNodeToggle,
} from '../actions'
import reducer from '../reducer'

describe('TreeList reducer', () => {
  const initialState = reducer(undefined, {})

  it('returns correct initial state', () => {
    expect(initialState.size).toBe(1)
    expect(initialState.get('treeListToggle').size).toBe(0)
  })

  it('changes node toggle correctly', () => {
    let state = reducer(initialState, changeNodeToggle(1, true))
    let treeListToggleShouldEqual = new Map()
    treeListToggleShouldEqual = treeListToggleShouldEqual.set(1, true)
    state = reducer(state, changeNodeToggle(1, true))
    expect(state.get('treeListToggle').equals(treeListToggleShouldEqual)).toBeTruthy()
  })
})
