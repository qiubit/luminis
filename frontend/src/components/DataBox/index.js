/*
 * Copyright (C) 2017 Paweł Goliński
 * Copyright (C) 2017 Piotr Wiśniewski
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the LICENSE file for details.
 */


import React from 'react'
import Paper from 'material-ui/Paper'
import CircularProgress from 'material-ui/CircularProgress'
import RefreshIcon from 'material-ui/svg-icons/action/cached'
import { Link } from 'react-router'

import BoxWrapper from './BoxWrapper'
import BoxHeader from './BoxHeader'
import BoxContent from './BoxContent'
import DataRow from './DataRow'

import { PENDING_STATE } from '../../containers/RequestManager/constants'
import { DATA_ERROR } from '../../containers/DataBox/constants'
import { NODE_URL } from '../../containers/NodePage/constants'


const style = {
  height: 200,
  width: 270,
  margin: 20,
  display: 'inline-block',
  verticalAlign: 'top',
}

const linkStyle = {
  textDecoration: 'none',
  color: 'black',
}

const refreshIconStyle = {
  cursor: 'pointer',
}

function DataBox(props) {
  let metrics = props.measurements.map(measurement => {
    if (measurement.state === PENDING_STATE) {
      return (
        <DataRow key={measurement.key}>{measurement.name}: <CircularProgress size={13}/></DataRow>)
    } else if (measurement.state === DATA_ERROR) {
      return <DataRow key={measurement.key}>{measurement.name}: Data Error</DataRow>
    } else {
      return <DataRow key={measurement.key}>{measurement.name}: {measurement.value}</DataRow>
    }
  })
	return (
    <Paper style={style} zDepth={5}>
    <BoxWrapper>
      <BoxHeader>
        <Link to={NODE_URL + "/" + props.nodeId.toString()} style={linkStyle}>{props.name}</Link>
        {
          props.refreshCallback &&
          <RefreshIcon
            style={refreshIconStyle}
            color="black"
            onClick={props.refreshCallback}/>
        }
      </BoxHeader>
      <BoxContent>
        <Link to={NODE_URL + "/" + props.nodeId.toString()} style={linkStyle}>{metrics}</Link>
      </BoxContent>
    </BoxWrapper>
    </Paper>
	)

}

DataBox.propTypes = {
  measurements: React.PropTypes.array.isRequired,
  name: React.PropTypes.string,
  refreshCallback: React.PropTypes.func,
  nodeId: React.PropTypes.number.isRequired,
}

export default DataBox
