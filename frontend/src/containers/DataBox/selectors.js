/*
 * Copyright (C) 2017 Paweł Goliński
 * Copyright (C) 2017 Piotr Wiśniewski
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the LICENSE file for details.
 */


import { createSelector } from 'reselect'
import { selectNodeMeasurements, selectMeasurementMetadata } from '../App/selectors'


export const selectNodeFavouriteMeasurements = createSelector(
  selectNodeMeasurements,
  selectMeasurementMetadata,
  (getNodeMeasurements, getMeasurementMetadata) => (nodeId) =>
    getNodeMeasurements(nodeId).filter(
      (measurementId) => getMeasurementMetadata(measurementId.toString()).get('is_favourite'))
)
