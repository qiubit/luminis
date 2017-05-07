import { fromJS, List, Map } from 'immutable'
import {
  changeShownMeasurements,
} from '../actions'
import {
  selectNodePage,
  selectShownMeasurements,
} from '../selectors'
import reducer from '../reducer'

describe('NodePage selectors', () => {
  const state = fromJS({
    NodePage: reducer(undefined, {})
  })
  it('chooses correct fields from global state', () => {
    const measurementsToShow = new List([1, 2, 3])
    let measurementIdsShownShouldEqual = new Map()
    measurementIdsShownShouldEqual = measurementIdsShownShouldEqual.set(1, true)
    measurementIdsShownShouldEqual = measurementIdsShownShouldEqual.set(2, true)
    measurementIdsShownShouldEqual = measurementIdsShownShouldEqual.set(3, true)
    let newState = state
    newState = newState.set('NodePage', reducer(newState.get('NodePage'), changeShownMeasurements(measurementsToShow)))
    expect(selectShownMeasurements(newState)).toEqual(measurementIdsShownShouldEqual)
  })
})
