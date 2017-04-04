import React from 'react'
import { connect } from 'react-redux'
import { Map } from 'immutable'

import DataBoxComponent from '../../components/DataBox/index';
import { selectMeasurementName, selectNodeMeasurements, selectNodeName } from '../App/selectors';
import { requestNewLiveData, cancelRequest } from '../RequestManager/actions'
import { selectActiveRequests } from '../RequestManager/selectors'
import { DATA_ERROR } from './constants'

class DataBox extends React.Component {
  constructor(props) {
    super(props)
    this.formatMeasurements = this.formatMeasurements.bind(this)
  }

  componentWillMount() {
    let dataRequests = new Map()
    let actionsToDispatch = []
    this.props.measurementIds.forEach((measurementId) => {
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

  componentWillUnmount() {
    const dataRequests = this.state.requestMeasurementMap
    dataRequests.forEach((measurementId, requestId) => {
      this.props.dispatch(cancelRequest(requestId))
    })
  }

  formatMeasurements() {
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
        if (requestData.get('data') && requestData.get('data').get('value')) {
          measurement.value = requestData.get('data').get('value')
        }
        measurement.state = requestData.get('state')
      } else {
        // Alert DataBoxComponent that something went wrong
        measurement.state = DATA_ERROR
      }
      formattedMeasurements.push(measurement)
      reactKey++
    })
    return formattedMeasurements
  }

  render() {
    const formattedMeasurements = this.formatMeasurements()
    return (
      <DataBoxComponent measurements={formattedMeasurements} name={this.props.nodeName}/>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  let nodeId = ownProps.nodeId.toString();
  let name = selectNodeName(state)(nodeId);
  let measurementIds = selectNodeMeasurements(state)(nodeId);
  let getMeasurementName = selectMeasurementName(state);
  return {
    nodeName: name,
    measurementIds: measurementIds,
    measurementNameGetter: getMeasurementName,
    activeRequests: selectActiveRequests(state),
  }
}

DataBox.propTypes = {
  nodeId: React.PropTypes.number.isRequired,
}

export default connect(mapStateToProps)(DataBox);
