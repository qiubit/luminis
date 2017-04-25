import React from 'react'
import Dygraph from 'dygraphs'
import { Map, fromJS } from 'immutable'
import MomentDate from 'moment'


import { Card, CardTitle, CardText } from 'material-ui/Card'
import RaisedButton from 'material-ui/RaisedButton'
import 'dygraphs/dist/dygraph.css'

import {
  requestNewChart,
  cancelRequest,
} from '../RequestManager/actions'
import {
  PENDING_STATE
} from '../RequestManager/constants'
import {
  DATA_RANGE_LIVE,
  DATA_RANGE_1D,
  DATA_RANGE_30D,
  DATA_RANGE_1Y,
  DATA_RANGE_MAX,
  DATA_RANGE_CUSTOM,

  AGGREGATION_1M,
  AGGREGATION_30M,
  AGGREGATION_24H,
  AGGREGATION_CUSTOM,
} from './constants'


class Graph extends React.Component {

  shouldComponentUpdate(nextProps) {
    return false
  }

  createGraph(data, labels) {
    if (data.length > 0) {
      return new Dygraph(
        document.getElementById("graphdiv"),
        data,
        {
          labels
        }
      )
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.data !== nextProps.data) {
      this.graph = this.createGraph(nextProps.data, nextProps.labels)
    }
  }
  componentDidMount() {
    this.graph = this.createGraph(this.props.data, this.props.labels)
  }

  render() {
    return (
      <div style={{ background: "#F0FFFF", color: "black", width: "100%" }} id="graphdiv"></div>
    )

  }

}


class ChartCard extends React.Component {
  constructor(props) {
    super(props)
    let begin = (new MomentDate()).subtract(1, 'day')
    let end = new MomentDate()
    let initDataRange = fromJS({
      label: DATA_RANGE_LIVE,
      begin,
      end
    })
    let initAggregation = fromJS({
      label: AGGREGATION_1M,
      value: 60
    })
    this.state = {
      dataRange: initDataRange,
      aggregation: initAggregation,
      requestDataRange: fromJS({}),
      requestAggregation: fromJS({}),
      measurementRequestMap: new Map(),
      measurementDataMap: new Map(),
      data: [],
      labels: [],

    }
    this.onDataRangeChange = this.onDataRangeChange.bind(this)
    this.onAggregationChange = this.onAggregationChange.bind(this)
    this.updateSubscriptions = this.updateSubscriptions.bind(this)
    this.makeRequest = this.makeRequest.bind(this)
  }


  // merge plots to one list of points
  makeData(plotsList) {
    let data = []
    let length = 0
    plotsList.forEach((plot) => {
      if (plot) {
        length = plot.size
      }
    })

    if (plotsList.size > 0) {
      for(var i = 0; i < length; ++i) {
        let dataPoint = []
        plotsList.forEach((plot) => {
          if (plot) {
            if (dataPoint.length === 0) {
              dataPoint.push(new Date(plot.get(i).get('x') * 1000))
            }
            dataPoint.push(plot.get(i).get('y'))
          }
        })
        data.push(dataPoint)
      }
    }
    return data
  }

  makeLabels(measurementDataMap){
    let newLabels = []
    newLabels.push("Time")
    measurementDataMap.forEach((data, measurementId) => {
      if (data) {
        newLabels.push(this.props.measurementNameGetter(measurementId.toString()))
      }
    })
    return newLabels
  }


  componentWillUpdate() {
    let newMeasurementDataMap = new Map()
    this.state.measurementRequestMap.forEach((requestId, measurementId) => {
      const request = this.props.activeRequests.get(requestId)
      let plot = null
      if (request && request.get('state') !== PENDING_STATE) {
        plot = request.get('data').get('plot_data')
      }
      newMeasurementDataMap = newMeasurementDataMap.set(measurementId, plot)
    })

    if (!this.state.measurementDataMap.equals(newMeasurementDataMap)) {
      this.setState({measurementDataMap: newMeasurementDataMap, data: this.makeData(newMeasurementDataMap.toList()), labels: this.makeLabels(newMeasurementDataMap)})
    }
  }

  makeRequest(nodeId, measurementId) {
    let beginTs = Math.floor(this.state.dataRange.get('begin').valueOf() / 1000)
    let endTs = Math.floor(this.state.dataRange.get('end').valueOf() / 1000)
    let updateData = false
    let aggregationLength = this.state.aggregation.get('value')
    let aggregationType = 'mean'
    return requestNewChart(nodeId, measurementId, beginTs, endTs, updateData, aggregationLength, aggregationType)
  }


  updateSubscriptions(newChartMeasurementIds, mounting = false) {
    const nodeId = this.props.params.nodeId
    // If measurements have changed, we should drop current subscriptions and make new ones
    if (this.state.requestDataRange !== this.state.dataRange || this.state.requestAggregation !== this.state.aggregation || mounting) {
      console.log('siema')
      const subscriptions = this.state.measurementRequestMap
      let cancelRequestActions = []
      subscriptions.forEach((requestId, measurementId) => {
        cancelRequestActions.push(cancelRequest(requestId))
      })
      cancelRequestActions.forEach((action) => this.props.dispatch(action))

      let newMeasurementRequestMap = new Map()
      let subscriptionRequestActions = []
      newChartMeasurementIds.forEach((measurementId) => {
        const subscriptionRequestAction = this.makeRequest(nodeId, measurementId)
        newMeasurementRequestMap =
          newMeasurementRequestMap.set(measurementId, subscriptionRequestAction.message.request_id)
        subscriptionRequestActions.push(subscriptionRequestAction)
      })
      this.setState({
        measurementRequestMap: newMeasurementRequestMap,
        requestDataRange: this.state.dataRange,
        requestAggregation: this.state.aggregation
      })
      subscriptionRequestActions.forEach((action) => this.props.dispatch(action))

    } else if (!newChartMeasurementIds.equals(this.props.chartMeasurementIds)) {
      // Drop current subscriptions
      const subscriptions = this.state.measurementRequestMap
      let cancelRequestActions = []
      subscriptions.forEach((requestId, measurementId) => {
        if (!newChartMeasurementIds.has(measurementId)) {
          cancelRequestActions.push(cancelRequest(requestId))
        }
      })
      cancelRequestActions.forEach((action) => this.props.dispatch(action))

      // Create new ones
      let newMeasurementRequestMap = new Map()
      let subscriptionRequestActions = []
      newChartMeasurementIds.forEach((measurementId) => {
        if (!subscriptions.has(measurementId)) {
          const subscriptionRequestAction = this.makeRequest(nodeId, measurementId)
          newMeasurementRequestMap =
            newMeasurementRequestMap.set(measurementId, subscriptionRequestAction.message.request_id)
          subscriptionRequestActions.push(subscriptionRequestAction)
        } else {
          newMeasurementRequestMap =
            newMeasurementRequestMap.set(measurementId, subscriptions.get(measurementId))
        }

      })
      this.setState({ measurementRequestMap: newMeasurementRequestMap })
      subscriptionRequestActions.forEach((action) => this.props.dispatch(action))
    }
  }

  // Subscribe to live data on mount
  componentWillMount() {
    this.updateSubscriptions(this.props.chartMeasurementIds, true)
  }

  componentWillReceiveProps(nextProps) {
    this.updateSubscriptions(nextProps.chartMeasurementIds)
  }

  componentWillUnmount() {
    // Calling updateSubscriptions with empty measurementIds list will result in request cleanup
    this.updateSubscriptions(fromJS([]))
  }

  onDataRangeChange = (label, begin, end) => () => {
    let newDataRange = fromJS({
      label,
      begin,
      end
    })
    this.setState({ dataRange: newDataRange })
  }

  onAggregationChange = (label, value) => () => {
    let newAggregation = fromJS({
      label,
      value
    })
    this.setState({ aggregation: newAggregation })
  }

  render() {
    //console.log(this.state.measurementRequestMap.toJS())
    const nodeMetadata = this.props.nodesMetadata.get(this.props.params.nodeId)
    return (
      <Card>
        <CardTitle title={nodeMetadata.get('name')}/>
        <CardText>
          <div>
            <Graph data={this.state.data} labels={this.state.labels}/>
            <p>Data Range</p>
            <RaisedButton
              onClick={this.onDataRangeChange(DATA_RANGE_LIVE, (new MomentDate()).subtract(1, 'day'), new MomentDate())}
              primary={this.state.dataRange.get('label') === DATA_RANGE_LIVE}
              label="LIVE"
            />
            <RaisedButton
              onClick={this.onDataRangeChange(DATA_RANGE_1D, (new MomentDate()).subtract(1, 'day'), new MomentDate())}
              primary={this.state.dataRange.get('label') === DATA_RANGE_1D}
              label="1D"
            />
            <RaisedButton
              onClick={this.onDataRangeChange(DATA_RANGE_30D, (new MomentDate()).subtract(30, 'day'), new MomentDate())}
              primary={this.state.dataRange.get('label') === DATA_RANGE_30D}
              label="30D"
            />
            <RaisedButton
              onClick={this.onDataRangeChange(DATA_RANGE_1Y, (new MomentDate()).subtract(1, 'year'), new MomentDate())}
              primary={this.state.dataRange.get('label') === DATA_RANGE_1Y}
              label="1Y"
            />
            <RaisedButton
              onClick={this.onDataRangeChange(DATA_RANGE_CUSTOM)}
              primary={this.state.dataRange.get('label') === DATA_RANGE_CUSTOM}
              label="CUSTOM"
            />
          </div>
          <div>
            <p>Aggregation</p>
            <RaisedButton
              onClick={this.onAggregationChange(AGGREGATION_1M, 60)}
              primary={this.state.aggregation.get('label') === AGGREGATION_1M}
              label="1M"
            />
            <RaisedButton
              onClick={this.onAggregationChange(AGGREGATION_30M, 30 * 60)}
              primary={this.state.aggregation.get('label') === AGGREGATION_30M}
              label="30M"
            />
            <RaisedButton
              onClick={this.onAggregationChange(AGGREGATION_24H, 24 * 60 * 60)}
              primary={this.state.aggregation.get('label') === AGGREGATION_24H}
              label="24H"
            />
            <RaisedButton
              onClick={this.onAggregationChange(AGGREGATION_CUSTOM, 30)}
              primary={this.state.aggregation.get('label') === AGGREGATION_CUSTOM}
              label="CUSTOM"
            />
          </div>
        </CardText>
      </Card>
    )
  }
}

export default ChartCard
