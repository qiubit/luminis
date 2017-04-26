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

  createGraph(data, labels, visibility) {
    if (data.length > 0) {
      return new Dygraph(
        document.getElementById("graphdiv"),
        data,
        {
          labels,
          visibility
        }
      )
    }
  }

  componentDidMount() {
    this.graph = this.createGraph(this.props.data, this.props.labels, this.props.visibility)
  }

  componentWillReceiveProps(nextProps) {
    if (this.graph) {
      if (this.props.data !== nextProps.data || this.props.labels !== nextProps.labels || this.props.visibility !== nextProps.visibility) {
        this.graph.updateOptions({
          'labels': nextProps.labels,
          'visibility': nextProps.visibility,
          'file': nextProps.data
        })
      }
    } else {
      this.graph = this.createGraph(this.props.data, this.props.labels, this.props.visibility)
    }
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
      chartRequestId: null,
      chartRequestData: null,
      data: [],
      labels: [],
      visibility: [],
    }
    this.onDataRangeChange = this.onDataRangeChange.bind(this)
    this.onAggregationChange = this.onAggregationChange.bind(this)
    this.updateSubscriptions = this.updateSubscriptions.bind(this)
    this.makeRequest = this.makeRequest.bind(this)
  }


  makeData(chartData) {
    let newData = chartData.slice()
    for (var i = 0; i < chartData.length; ++i) {
      newData[i] = newData[i].slice()
      newData[i][0] = new Date(newData[i][0]  * 1000)
    }
    return newData
  }

  makeLabels(measurementDataMap){
    let newLabels = []
    newLabels.push("Time")
    measurementDataMap.forEach((measurementId) => {
      newLabels.push(this.props.measurementNameGetter(measurementId.toString()))
    })
    return newLabels
  }

  makeVisibility(measurementIds, measurementIdsShown) {
    let newVisibility = []
    measurementIds.forEach((measurementId) => {
      newVisibility.push(measurementIdsShown.get(measurementId))
    })
    return newVisibility
  }



  componentWillUpdate() {
    let request = this.props.activeRequests.get(this.state.chartRequestId)
    let newChartRequestData = null
    if (request && request.get('state') !== PENDING_STATE) {
      newChartRequestData = request.get('data').plot_data
    }

    if (newChartRequestData && this.state.chartRequestData !== newChartRequestData) {
      this.setState({chartRequestData: newChartRequestData, data: this.makeData(newChartRequestData)})
    }
  }

  makeRequest(nodeId, measurementIds) {
    let beginTs = Math.floor(this.state.dataRange.get('begin').valueOf() / 1000)
    let endTs = Math.floor(this.state.dataRange.get('end').valueOf() / 1000)
    let updateData = false
    let aggregationLength = this.state.aggregation.get('value')
    let aggregationType = 'mean'
    return requestNewChart(nodeId, measurementIds.toJS(), beginTs, endTs, updateData, aggregationLength, aggregationType)
  }


  updateSubscriptions(newMeasurementIds, mounting = false) {
    const nodeId = this.props.params.nodeId
    // If measurements have changed, we should drop current subscriptions and make new ones
    if ((!newMeasurementIds.equals(this.props.measurementIds)) || this.state.requestDataRange !== this.state.dataRange || this.state.requestAggregation !== this.state.aggregation || mounting) {

      if (this.state.chartRequestId) {
        this.props.dispatch(cancelRequest(this.state.chartRequestId))
      }

      let newChartRequest = this.makeRequest(nodeId, newMeasurementIds)
      this.props.dispatch(newChartRequest)

      this.setState({
        chartRequestId: newChartRequest.message.request_id,
        requestDataRange: this.state.dataRange,
        requestAggregation: this.state.aggregation,
      })
    }
  }

  updateLabels(newMeasurementIds, mounting = false) {
    if (!newMeasurementIds.equals(this.props.measurementIds) || mounting) {
      this.setState({
        labels: this.makeLabels(newMeasurementIds)
      })
    }
  }

  updateVisibility(newMeasurementIds, newMeasurementIdsShown, mounting = false) {
    if (!newMeasurementIds.equals(this.props.measurementIds) || !newMeasurementIdsShown.equals(this.props.measurementIdsShown) || mounting) {
      this.setState({
        visibility: this.makeVisibility(newMeasurementIds, newMeasurementIdsShown)
      })
    }
  }

  // Subscribe to live data on mount
  componentWillMount() {
    this.updateSubscriptions(this.props.measurementIds, true)
    this.updateLabels(this.props.measurementIds, true)
    this.updateVisibility(this.props.measurementIds, this.props.measurementIdsShown, true)
  }

  componentWillReceiveProps(nextProps) {
    this.updateSubscriptions(nextProps.measurementIds)
    this.updateLabels(nextProps.measurementIds)
    this.updateVisibility(nextProps.measurementIds, nextProps.measurementIdsShown)
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
    const nodeMetadata = this.props.nodesMetadata.get(this.props.params.nodeId)
    return (
      <Card>
        <CardTitle title={nodeMetadata.get('name')}/>
        <CardText>
          <div>
            <Graph data={this.state.data} labels={this.state.labels} visibility={this.state.visibility}/>
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
