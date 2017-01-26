import { fromJS } from 'immutable';

// Get all measurements for a given node
export function getNodeMeasurements(measurementData, id) {
  if (measurementData.has(id)) {
    return measurementData.get(id);
  } else {
    return fromJS({});
  }
}

// Given all node measurements, select measurements
// corresponding to a given name.
export function getNamedMeasurements(nodeMeasurements, name) {
  if (nodeMeasurements.has(name)) {
    return nodeMeasurements.get(name);
  } else {
    return fromJS([]);
  }
}
