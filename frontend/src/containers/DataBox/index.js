import { connect } from 'react-redux'

import DataBox from '../../components/DataBox/index';
import { selectMeasurementName, selectNodeMeasurements, selectRequestLiveDataValue, selectNodeName } from '../App/selectors';
import { selectNodeMeasurementRequest } from '../DataBoxManager/selectors'


function formatMeasurements(availableMeasurements, getRequestLiveDataValue, getMeasurementName, getMeasurementRequest) {
  let measurements = [];
  let reactKey = 1;

  availableMeasurements.forEach((measurementId) => {
    let requestId = getMeasurementRequest(measurementId.toString())
    let lastValue = getRequestLiveDataValue(requestId);
    let showLoadingIcon = true;
    if (lastValue != null) {
      showLoadingIcon = false;
    }
    let measurement = {
      key: reactKey,
      name: getMeasurementName(measurementId.toString()),
      value: lastValue,
      showLoadingIcon: showLoadingIcon
    }
    reactKey += 1;
    measurements.push(measurement);
  });
  return measurements
}


const mapStateToProps = (state, ownProps) => {
  let nodeId = ownProps.nodeId.toString();
  let name = selectNodeName(state)(nodeId);
  let measurements = selectNodeMeasurements(state)(nodeId);
  let getRequestLiveDataValue = selectRequestLiveDataValue(state);
  let getMeasurementName = selectMeasurementName(state);
  let getMeasurementRequest = (measurementId) => selectNodeMeasurementRequest(state)(nodeId, measurementId)
  let formattedMeasurements = formatMeasurements(measurements, getRequestLiveDataValue, getMeasurementName, getMeasurementRequest);
  return {
    key: ownProps.nodeId,
    name: name,
    measurements: formattedMeasurements,
  }
}

export default connect(mapStateToProps)(DataBox);
