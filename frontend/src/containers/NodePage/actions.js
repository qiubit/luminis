import {
  SHOW_MEASUREMENT,
  HIDE_MEASUREMENT,
  CHANGE_SHOWN_MEASUREMENTS,
} from './constants'

export function showMeasurement(measurementId) {
  return {
    type: SHOW_MEASUREMENT,
    measurementId
  }
}

export function hideMeasurement(measurementId) {
  return {
    type: HIDE_MEASUREMENT,
    measurementId
  }
}

export function changeShownMeasurements(measurementIdsShown) {
  return {
    type: CHANGE_SHOWN_MEASUREMENTS,
    measurementIdsShown
  }
}
