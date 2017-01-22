import { connect } from 'react-redux'

import DataBox from '../../components/DataBox/index';

function getName(id) {
  return 'lampa' + id;
}

function getMeasurements(measurement_data, id) {
  let measurements = [];
  let react_key = 1;
  if (measurement_data) {
    if (measurement_data.has(id)) {
      let data_for_id = measurement_data.get(id);
      data_for_id.forEach((value, key, map) => {
        let last_value = 0;
        let shouldLoading = true;
        if (value.length > 0) {
          shouldLoading = false;
          last_value = value[value.length - 1].value;
        }
        let measurement = {
          key: react_key,
          name: key,
          value: last_value,
          shouldLoading: shouldLoading
        }
        react_key += 1;
        measurements.push(measurement);
      })
    }
  }
  return measurements
}


const mapStateToProps = (state, ownProps) => {
  let name = getName(ownProps.id);
  let measurements = getMeasurements(state.websocketReducer.measurement_data, ownProps.id);
  return {
    key: ownProps.id,
    name: name,
    measurements: measurements
  }
}

export default connect(mapStateToProps)(DataBox);
