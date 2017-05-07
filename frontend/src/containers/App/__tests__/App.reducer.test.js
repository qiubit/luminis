import { Map } from 'immutable'

import {
  drawerToggle,
  drawerChange,
  saveActiveNodeId,
} from '../actions'
import reducer from '../reducer'

describe('App reducer', () => {
  const initialState = reducer(undefined, {})

  it('returns correct initial state', () => {
    expect(initialState.size).toBe(6)
    expect(initialState.get('drawerOpen')).toBe(true)
    expect(initialState.get('activeNodeId')).toBe(null)
    expect(initialState.get('nodesMetadata').size).toBe(0)
    expect(initialState.get('treeStructure').size).toBe(0)
    expect(initialState.get('treeTimestamp')).toBe(null)
    expect(initialState.get('measurementsMetadata').size).toBe(0)
  })

  it('toggles drawer on drawerToggle', () => {
    let state = reducer(initialState, drawerToggle())
    expect(state.get('drawerOpen')).toBe(false)
    state = reducer(state, drawerToggle())
    expect(state.get('drawerOpen')).toBe(true)
  })

  it('changes drawer on drawerChange', () => {
    let state = reducer(initialState, drawerChange(false))
    expect(state.get('drawerOpen')).toBe(false)
    state = reducer(state, drawerChange(true))
    expect(state.get('drawerOpen')).toBe(true)
  })

  it('changes active node id on saveActiveNodeId', () => {
    let state = reducer(initialState, saveActiveNodeId(2))
    expect(state.get('activeNodeId')).toBe(2)
  })
})
