import { Map } from 'immutable';

import {
  SHOW_MEASUREMENT,
  HIDE_MEASUREMENT,
  CHANGE_SHOWN_MEASUREMENTS,
} from './constants'

const initialState = new Map({
  measurementIdsShown: new Map(),
})

function nodePageReducer(state = initialState, action) {
  switch (action.type) {
    case SHOW_MEASUREMENT:
      return state
        .set('measurementIdsShown', state.get('measurementIdsShown').set(action.measurementId, true))
    case HIDE_MEASUREMENT:
      return state
        .set('measurementIdsShown', state.get('measurementIdsShown').set(action.measurementId, false))
    case CHANGE_SHOWN_MEASUREMENTS:
      let measurementIdsMap = new Map()
      action.measurementIdsShown.forEach((id) => {
        measurementIdsMap = measurementIdsMap.set(id, true)
      })
      return state
        .set('measurementIdsShown', measurementIdsMap)
    default:
      return state
  }
}

export default nodePageReducer
