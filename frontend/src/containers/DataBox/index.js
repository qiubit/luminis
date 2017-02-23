import { connect } from 'react-redux'

import DataBox from '../../components/DataBox/index';
import { selectMeasurementData } from '../App/selectors';
import { getNodeMeasurements } from '../WebsocketConnection/parsers';

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
      lastValue = value.get(value.size - 1).get('value');
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
  let measurementData = selectMeasurementData(state);
  let measurements = getNodeMeasurements(measurementData, ownProps.id);
  let formattedMeasurements = formatMeasurements(measurements);
  return {
    key: ownProps.id,
    name: name,
    measurements: formattedMeasurements,
  }
}

export default connect(mapStateToProps)(DataBox);
