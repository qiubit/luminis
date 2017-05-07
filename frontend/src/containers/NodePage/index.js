/*
 * Copyright (C) 2017 Paweł Goliński
 * Copyright (C) 2017 Piotr Wiśniewski
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the LICENSE file for details.
 */


import React from 'react'
import MediaQuery from 'react-responsive'
import { connect } from 'react-redux'
import { Map, fromJS } from 'immutable'

import { Card, CardTitle, CardText } from 'material-ui/Card'
import { List, ListItem } from 'material-ui/List'
import Paper from 'material-ui/Paper'
import Subheader from 'material-ui/Subheader'
import Checkbox from 'material-ui/Checkbox'

import {
  selectDrawerOpen,
  selectNodesMetadata,
  selectNodeName,
  selectNodeMeasurements,
  selectMeasurementName,
} from '../App/selectors'
import { drawerChange } from '../App/actions'
import ChartCard from '../ChartCard/index'
import {
  selectShownMeasurements,
} from './selectors'
import {
  showMeasurement,
  hideMeasurement,
  changeShownMeasurements,
} from './actions'
import {
  requestNewLiveData,
  cancelRequest,
} from '../RequestManager/actions'
import {
  selectActiveRequests,
} from '../RequestManager/selectors'
import {
  PENDING_STATE
} from '../RequestManager/constants'

// Subcomponent of NodePage that renders right toolbar
class RightBar extends React.Component {
  constructor(props) {
    super(props)
    this.state = { measurementRequestMap: new Map() }
    this.updateSubscriptions = this.updateSubscriptions.bind(this)
  }

  updateSubscriptions(newMeasurementIds, mounting = false) {
    const nodeId = parseInt(this.props.params.nodeId, 10)
    // If measurements have changed, we should drop current subscriptions and make new ones
    if (!newMeasurementIds.equals(this.props.measurementIds) || mounting) {
      // Drop current subscriptions
      const subscriptions = this.state.measurementRequestMap
      let cancelRequestActions = []
      subscriptions.forEach((requestId, measurementId) => {
        cancelRequestActions.push(cancelRequest(requestId))
      })
      cancelRequestActions.forEach((action) => this.props.dispatch(action))

      // Create new ones
      let newMeasurementRequestMap = new Map()
      let subscriptionRequestActions = []
      newMeasurementIds.forEach((measurementId) => {
        const subscriptionRequestAction = requestNewLiveData(nodeId, measurementId)
        newMeasurementRequestMap =
          newMeasurementRequestMap.set(measurementId, subscriptionRequestAction.message.request_id)
        subscriptionRequestActions.push(subscriptionRequestAction)
      })
      this.setState({ measurementRequestMap: newMeasurementRequestMap })
      subscriptionRequestActions.forEach((action) => this.props.dispatch(action))
    }
  }

  // Subscribe to live data on mount
  componentWillMount() {
    this.updateSubscriptions(this.props.measurementIds, true)
  }

  componentWillReceiveProps(nextProps) {
    this.updateSubscriptions(nextProps.measurementIds)
  }

  componentWillUnmount() {
    // Calling updateSubscriptions with empty measurementIds list will result in request cleanup
    this.updateSubscriptions(fromJS([]))
  }

  render() {
    const nodeMetadata = this.props.nodesMetadata.get(this.props.params.nodeId)
    return (
      <List>
        <Subheader>{nodeMetadata.get("name")}</Subheader>
        {this.props.measurementIds &&
          this.props.measurementIds.map((id) => {
            const request =
              this.props.activeRequests.get(this.state.measurementRequestMap.get(id))
            let val = null
            if (request && request.get('state') !== PENDING_STATE) {
              val = request.get('data').value
            }
            return (<ListItem
              leftCheckbox={
                <Checkbox
                  checked={this.props.measurementIdsShown.get(id) === undefined ?
                    false : this.props.measurementIdsShown.get(id)}
                  onClick={this.props.measurementIdsShown.get(id) ?
                    this.props.onHideMeasurement(id) : this.props.onShowMeasurement(id)}
                />
              }
              key={id}
            >
              {this.props.measurementNameGetter(id.toString())}
              {val ? ": " + val : ""}
            </ListItem>)})
        }
      </List>
    )
  }
}

class NodePage extends React.Component {
  componentWillMount() {
    this.props.sendCloseDrawer()
    this.props.onChangeShownMeasurements(this.props.measurementIds)
  }

  componentWillReceiveProps(nextProps) {
    const measurementIds = nextProps.measurementIds
    // We updated list of measurements (e.g. node metadata was downloaded)
    if (measurementIds.size !== this.props.measurementIdsShown.size) {
      this.props.onChangeShownMeasurements(measurementIds)
    }
  }

  render() {
    // Define chart and right bar styles
    const chartStyle = {
      width: 800,
      margin: 20,
      textAlign: 'center',
      display: 'inline-block',
    }
    const rightBarStyle = {
      width: 200,
      height: "100vh",
      margin: 0,
      textAlign: 'left',
      display: 'inline-block',
      float: 'right',
    }

    // Render error panel if node metadata was not found
    const nodeMetadata = this.props.nodesMetadata.get(this.props.params.nodeId)
    if (!nodeMetadata) {
      return (
        <Paper style={chartStyle} zDepth={3}>
          <Card>
            <CardTitle title="Error"/>
            <CardText>
              Node not found
            </CardText>
          </Card>
        </Paper>
      )
    }

    return (
      <div>
        <MediaQuery minWidth={1050}>
          <Paper style={rightBarStyle} zDepth={3}>
            <RightBar {...this.props}/>
          </Paper>
          <Paper style={chartStyle} zDepth={3}>
            <ChartCard {...this.props}/>
          </Paper>
        </MediaQuery>
        <MediaQuery maxWidth={1049}>
          <Paper zDepth={3}>
            <RightBar {...this.props}/>
          </Paper>
          <Paper zDepth={3} style={{ margin: 20 }}>
            <ChartCard {...this.props}/>
          </Paper>
        </MediaQuery>
      </div>
    )
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    sendCloseDrawer: () => dispatch(drawerChange(false)),
    onShowMeasurement: (measurementId) => () => dispatch(showMeasurement(measurementId)),
    onHideMeasurement: (measurementId) => () => dispatch(hideMeasurement(measurementId)),
    onChangeShownMeasurements: (measurementIds) =>
                                  dispatch(changeShownMeasurements(measurementIds)),
    dispatch,
  }
}

const mapStateToProps = (state, ownProps) => {
  let nodeId = ownProps.params.nodeId.toString()
  let name = selectNodeName(state)(nodeId)
  let measurementIds = selectNodeMeasurements(state)(nodeId)
  let getMeasurementName = selectMeasurementName(state)
  let measurementIdsShown = selectShownMeasurements(state)
  return {
    nodeName: name,
    drawerOpen: selectDrawerOpen(state),
    nodesMetadata: selectNodesMetadata(state),
    measurementIds: measurementIds,
    measurementNameGetter: getMeasurementName,
    measurementIdsShown: measurementIdsShown,
    activeRequests: selectActiveRequests(state),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(NodePage)
