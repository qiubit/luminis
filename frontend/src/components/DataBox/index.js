import React from 'react';
import Paper from 'material-ui/Paper';
import CircularProgress from 'material-ui/CircularProgress';

import BoxWrapper from './BoxWrapper';
import BoxHeader from './BoxHeader';
import BoxContent from './BoxContent';
import DataRow from './DataRow';

const style = {
  height: 200,
  width: 270,
  margin: 20,
  display: 'inline-block',
};

function DataBox(props) {
  let metrics = props.measurements.map(measurement => {
      if (measurement.showLoadingIcon) {
        return <DataRow key={measurement.key}>{measurement.name}: <CircularProgress size={13}/></DataRow>;
      } else {
        return <DataRow key={measurement.key}>{measurement.name}: {measurement.value}</DataRow>;
      }
  });
	return (
    <Paper style={style} zDepth={5}>
    <BoxWrapper>
    		<BoxHeader>{props.name}</BoxHeader>
        <BoxContent>
          {metrics}
        </BoxContent>
    </BoxWrapper>
    </Paper>
		);

}

export default DataBox;
