/*
 * Copyright (C) 2017 Paweł Goliński
 * Copyright (C) 2017 Piotr Wiśniewski
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the LICENSE file for details.
 */


import { Map } from 'immutable'

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
        .set(
          'measurementIdsShown',
          state.get('measurementIdsShown').set(action.measurementId, true))
    case HIDE_MEASUREMENT:
      return state
        .set(
          'measurementIdsShown',
          state.get('measurementIdsShown').set(action.measurementId, false))
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
