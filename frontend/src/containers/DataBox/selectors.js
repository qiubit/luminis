import { createSelector } from 'reselect';
import { selectNodeMeasurements, selectMeasurementMetadata } from '../App/selectors'


export const selectNodeFavouriteMeasurements = createSelector(
  selectNodeMeasurements,
  selectMeasurementMetadata,
  (getNodeMeasurements, getMeasurementMetadata) => (nodeId) =>
    getNodeMeasurements(nodeId).filter((measurementId) => getMeasurementMetadata(measurementId.toString()).get('is_favourite'))
);
