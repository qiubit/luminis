import { getMeasurementDataForId, getMeasurementDataByName } from './selectors'
import { insertToSortedArray } from './utils';

function parseMeasurements(dataForId, measurements) {
  for (var i = 0; i < measurements.length; ++i) {
    let dataPoint = measurements[i]
    let timeseries = getMeasurementDataByName(dataForId, dataPoint.name);
    timeseries = insertToSortedArray((point) => (dataPoint.timestamp > point.timestamp), timeseries, dataPoint);
    if (timeseries.size > 10) {
      // length is at most 11 so shift is enough
      timeseries = timeseries.shift();
    }
    dataForId = dataForId.set(dataPoint.name, timeseries);
  }
  return dataForId;
}

export function parseDataFromWebsocket(measurementData, rawData) {
  let data = JSON.parse(rawData);
  for (var i = 0; i < data.length; ++i) {
    let id = data[i].id;
    let measurements = data[i].measurements;
    let dataForId = getMeasurementDataForId(measurementData, id);
    dataForId = parseMeasurements(dataForId, measurements);
    measurementData = measurementData.set(id, dataForId);
  }
  return measurementData;
}
