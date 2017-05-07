import { Map, fromJS } from 'immutable'

import {
  CHANGE_NODE_TOGGLE,
} from '../constants'
import {
  changeNodeToggle,
} from '../actions'
import {
  selectTreeListToggle
} from '../selectors'
import reducer from '../reducer'

describe('TreeList selectors', () => {
  const state = fromJS({
    TreeList: reducer(undefined, {})
  })

  it('chooses correct fields from global state', () => {
    let newState = state
    newState = newState.set('TreeList', reducer(newState.get('TreeList'), changeNodeToggle(1, true)))
    let treeListToggleShouldEqual = new Map()
    treeListToggleShouldEqual = treeListToggleShouldEqual.set(1, true)
    expect(selectTreeListToggle(newState).equals(treeListToggleShouldEqual)).toBeTruthy()
  })
})
