import * as Immutable from 'immutable';

export function getMeasurementData(state) {
  if (state.websocketReducer.measurementData) {
    return state.websocketReducer.measurementData;
  } else {
    return Immutable.Map();
  }
}

export function getMeasurementDataForId(measurementData, id) {
  if (measurementData.has(id)) {
    return measurementData.get(id);
  } else {
    return Immutable.Map();
  }
}

export function getMeasurementDataByName(measurementDataForID, name) {
  if (measurementDataForID.has(name)) {
    return measurementDataForID.get(name);
  } else {
    return Immutable.List();
  }
}
