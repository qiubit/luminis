/*
 * Copyright (C) 2017 Paweł Goliński
 * Copyright (C) 2017 Piotr Wiśniewski
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the LICENSE file for details.
 */


import React from 'react'
import { connect } from 'react-redux'
import { Map } from 'immutable'

import DataBoxComponent from '../../components/DataBox/index'
import { selectMeasurementName, selectNodeName } from '../App/selectors'
import { selectNodeFavouriteMeasurements } from './selectors'
import { requestNewLiveData, cancelRequest } from '../RequestManager/actions'
import { selectActiveRequests } from '../RequestManager/selectors'
import { STALE_STATE } from '../RequestManager/constants'
import { DATA_ERROR } from './constants'

class DataBox extends React.Component {
  constructor(props) {
    super(props)
    this.formatMeasurements = this.formatMeasurements.bind(this)
    this.createRequests = this.createRequests.bind(this)
    this.dropRequests = this.dropRequests.bind(this)
    this.refreshCallback = this.refreshCallback.bind(this)
  }

  createRequests(measurementIds) {
    let dataRequests = new Map()
    let actionsToDispatch = []
    measurementIds.forEach((measurementId) => {
      actionsToDispatch.push(requestNewLiveData(this.props.nodeId, measurementId))
    })
    // Save request ids and dispatch actions
    actionsToDispatch.forEach((action) => {
      dataRequests =
        dataRequests.set(action.message.request_id, action.message.params.measurement_id)
      this.props.dispatch(action)
    })
    this.setState({ requestMeasurementMap: dataRequests })
  }

  dropRequests() {
    const dataRequests = this.state.requestMeasurementMap
    dataRequests.forEach((measurementId, requestId) => {
      this.props.dispatch(cancelRequest(requestId))
    })
  }

  componentWillMount() {
    this.createRequests(this.props.measurementIds)
  }

  componentWillUnmount() {
    this.dropRequests()
  }

  refreshCallback() {
    this.dropRequests()
    this.createRequests(this.props.measurementIds)
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.measurementIds.equals(nextProps.measurementIds)) {
      this.dropRequests()
      this.createRequests(nextProps.measurementIds)
    }
  }

  // We set refreshObj.refreshFlag to true if some measurement has PENDING_STATE or DATA_ERROR
  formatMeasurements(refreshObj) {
    let formattedMeasurements = []
    let reactKey = 1
    this.state.requestMeasurementMap.forEach((measurementId, requestId) => {
      const requestData = this.props.activeRequests.get(requestId)
      let measurement = {
        key: reactKey,
        name: this.props.measurementNameGetter(measurementId.toString()),
        value: 0,
      }
      if (requestData) {
        if (requestData.get('data') && requestData.get('data').value) {
          measurement.value = requestData.get('data').value
        }
        measurement.state = requestData.get('state')
        if (measurement.state === STALE_STATE) {
          refreshObj.refreshFlag = true
        }
      } else {
        // Alert DataBoxComponent that something went wrong
        measurement.state = DATA_ERROR
        refreshObj.refreshFlag = true
      }
      formattedMeasurements.push(measurement)
      reactKey++
    })
    return formattedMeasurements
  }

  render() {
    let refreshObj = { refreshFlag: false }
    const formattedMeasurements = this.formatMeasurements(refreshObj)
    return (
      <DataBoxComponent
        measurements={formattedMeasurements}
        name={this.props.nodeName}
        refreshCallback={refreshObj.refreshFlag ? this.refreshCallback : undefined}
        nodeId={this.props.nodeId}
      />
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  let nodeId = ownProps.nodeId.toString()
  let name = selectNodeName(state)(nodeId)
  let measurementIds = selectNodeFavouriteMeasurements(state)(nodeId)
  let getMeasurementName = selectMeasurementName(state)
  return {
    nodeName: name,
    measurementIds: measurementIds,
    measurementNameGetter: getMeasurementName,
    activeRequests: selectActiveRequests(state),
    nodeId: ownProps.nodeId,
  }
}

DataBox.propTypes = {
  nodeId: React.PropTypes.number.isRequired,
}

export default connect(mapStateToProps)(DataBox)
