/*
 * Copyright (C) 2017 Paweł Goliński
 * Copyright (C) 2017 Piotr Wiśniewski
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the LICENSE file for details.
 */


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
