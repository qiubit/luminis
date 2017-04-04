import React from 'react';
import Paper from 'material-ui/Paper';
import CircularProgress from 'material-ui/CircularProgress';

import BoxWrapper from './BoxWrapper';
import BoxHeader from './BoxHeader';
import BoxContent from './BoxContent';
import DataRow from './DataRow';

import { PENDING_STATE } from '../../containers/RequestManager/constants'
import { DATA_ERROR } from '../../containers/DataBox/constants'

const style = {
  height: 200,
  width: 270,
  margin: 20,
  display: 'inline-block',
};

function DataBox(props) {
  let metrics = props.measurements.map(measurement => {
    if (measurement.state === PENDING_STATE) {
      return <DataRow key={measurement.key}>{measurement.name}: <CircularProgress size={13}/></DataRow>;
    } else if (measurement.state === DATA_ERROR) {
      return <DataRow key={measurement.key}>{measurement.name}: Data Error</DataRow>;
    } else {
      return <DataRow key={measurement.key}>{measurement.name}: {measurement.value}</DataRow>;
    }
  });
	return (
    <Paper style={style} zDepth={5}>
    <BoxWrapper>
      <BoxHeader>{props.name}</BoxHeader>
      <BoxContent>{metrics}</BoxContent>
    </BoxWrapper>
    </Paper>
	);

}

DataBox.propTypes = {
  measurements: React.PropTypes.array.isRequired,
  name: React.PropTypes.string,
}

export default DataBox;
