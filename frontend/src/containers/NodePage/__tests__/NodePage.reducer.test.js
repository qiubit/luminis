import { Map, List } from 'immutable'

import {
  SHOW_MEASUREMENT,
  HIDE_MEASUREMENT,
  CHANGE_SHOWN_MEASUREMENTS,
} from '../constants'
import {
  showMeasurement,
  hideMeasurement,
  changeShownMeasurements,
} from '../actions'
import reducer from '../reducer'

describe('NodePage reducer', () => {
  const initialState = reducer(undefined, {})
  const measurementsToShow = new List([1, 2, 3])

  it('returns correct initial state', () => {
    expect(initialState.size).toBe(1)
    expect(initialState.get('measurementIdsShown').size).toBe(0)
  })

  it('declares all measurements as shown on changeShownMeasurements', () => {
    let state = reducer(initialState, changeShownMeasurements(measurementsToShow))
    let measurementIdsShownShouldEqual = new Map()
    measurementIdsShownShouldEqual = measurementIdsShownShouldEqual.set(1, true)
    measurementIdsShownShouldEqual = measurementIdsShownShouldEqual.set(2, true)
    measurementIdsShownShouldEqual = measurementIdsShownShouldEqual.set(3, true)
    expect(state.get('measurementIdsShown').equals(measurementIdsShownShouldEqual)).toBeTruthy()
  })

  it('shows and hides measurements on corresponding actions', () => {
    let state = reducer(initialState, changeShownMeasurements(measurementsToShow))
    state = reducer(state, showMeasurement(2))
    let measurementIdsShownShouldEqual = new Map()
    measurementIdsShownShouldEqual = measurementIdsShownShouldEqual.set(1, true)
    measurementIdsShownShouldEqual = measurementIdsShownShouldEqual.set(2, true)
    measurementIdsShownShouldEqual = measurementIdsShownShouldEqual.set(3, true)
    expect(state.get('measurementIdsShown').equals(measurementIdsShownShouldEqual)).toBeTruthy()
    state = reducer(state, hideMeasurement(2))
    measurementIdsShownShouldEqual = measurementIdsShownShouldEqual.set(2, false)
    expect(state.get('measurementIdsShown').equals(measurementIdsShownShouldEqual)).toBeTruthy()
    state = reducer(state, showMeasurement(2))
    measurementIdsShownShouldEqual = measurementIdsShownShouldEqual.set(2, true)
    expect(state.get('measurementIdsShown').equals(measurementIdsShownShouldEqual)).toBeTruthy()
  })
})
