import { connect } from 'react-redux'

import DataBox from '../../components/DataBox/index';
import { getMeasurementData, getMeasurementDataForId } from '../WebsocketConnection/selectors';

function getName(id) {
  return 'lampa' + id;
}

function formatMeasurements(measurementDataForID) {
  let measurements = [];
  let reactKey = 1;
  measurementDataForID.forEach((value, key, map) => {
    let lastValue = 0;
    let showLoadingIcon = true;
    if (value.size > 0) {
      showLoadingIcon = false;
      lastValue = value.get(value.size - 1).value;
    }
    let measurement = {
      key: reactKey,
      name: key,
      value: lastValue,
      showLoadingIcon: showLoadingIcon
    }
    reactKey += 1;
    measurements.push(measurement);
  })
  return measurements
}


const mapStateToProps = (state, ownProps) => {
  let name = getName(ownProps.id);
  let measurementData = getMeasurementData(state);
  let measurementDataForID = getMeasurementDataForId(measurementData, ownProps.id);
  let measurements = formatMeasurements(measurementDataForID);
  return {
    key: ownProps.id,
    name: name,
    measurements: measurements
  }
}

export default connect(mapStateToProps)(DataBox);
