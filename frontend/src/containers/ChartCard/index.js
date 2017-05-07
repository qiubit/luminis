/*
 * Copyright (C) 2017 Paweł Goliński
 * Copyright (C) 2017 Piotr Wiśniewski
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the LICENSE file for details.
 */


import React from 'react'
import Dygraph from 'dygraphs'
import { fromJS } from 'immutable'
import MomentDate from 'moment'
import DateTimePicker from 'react-datetime'
import NumericInput from  'react-numeric-input'


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
  DATA_RANGE_CUSTOM,

  AGGREGATION_1M,
  AGGREGATION_30M,
  AGGREGATION_24H,
  AGGREGATION_CUSTOM,
} from './constants'


class DatePickerBar extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      begin: props.begin,
      end: props.end
    }
    this.setBegin = this.setBegin.bind(this)
    this.setEnd = this.setEnd.bind(this)
  }

  setBegin(newBegin) {
    if (!(typeof newBegin === 'string' || newBegin instanceof String)) {
      this.setState({begin: newBegin})
    }
  }

  setEnd(newEnd) {
    if (!(typeof newEnd === 'string' || newEnd instanceof String)) {
      this.setState({end: newEnd})
    }
  }

  render() {
    return (
      <div style={{display: 'flex', justifyContent: 'space-between'}}>
        <DateTimePicker
          onChange={this.setBegin}
          open={false}
          dateFormat={'DD.MM.YYYY'}
          timeFormat={'HH:mm:ss'}
          defaultValue={this.props.begin}/>
        <RaisedButton
          onClick={this.props.onSubmit(this.state.begin, this.state.end)}
          primary={true}
          label="SUBMIT"
          />
        <DateTimePicker
          onChange={this.setEnd}
          open={false}
          dateFormat={'DD.MM.YYYY'}
          timeFormat={'HH:mm:ss'}
          defaultValue={this.props.end}/>
      </div>
    )
  }
}


function StyledInput(props) {
  return (
    <NumericInput
      {...props}
      style={{input: {
        'color': 'white',
        'backgroundColor': 'rgb(48, 48, 48)',
        'fontSize': '16px',
        'boxShadow': 'rgba(0, 0, 0, 0.2) 0px 1px 6px, rgba(0, 0, 0, 0.12) 0px 1px 4px',
        'height': '37px',
        'textAlign': 'center',
        'border': '0px',
      }}}/>
  )
}

class AggregationPickerBar extends React.Component {
  constructor(props) {
    super(props)
    let sec = this.props.aggregationLength
    let min = 0
    let hours = 0

    min = Math.floor(sec / 60)
    sec -= min * 60

    hours = Math.floor(min / 60)
    min -= hours * 60
    this.state = {
      aggregationHours: hours,
      aggregationMinutes: min,
      aggregationSeconds: sec
    }
    this.getAggregationLength = this.getAggregationLength.bind(this)
  }

  getAggregationLength() {
    return this.state.aggregationSeconds + 60 * this.state.aggregationMinutes + 3600 * this.state.aggregationHours
  }

  render() {
    return (
      <div>
        <StyledInput
          min={0}
          format={(num) => num + 'h'}
          value={this.state.aggregationHours}
          onChange={(value) => {this.setState({aggregationHours: value})}}/>
        <StyledInput
          min={0}
          max={59}
          format={(num) => num + 'm'}
          value={this.state.aggregationMinutes}
          onChange={(value) => {this.setState({aggregationMinutes: value})}}/>
        <StyledInput
          min={0}
          max={59}
          format={(num) => num + 's'}
          value={this.state.aggregationSeconds}
          onChange={(value) => {this.setState({aggregationSeconds: value})}}/>
        <RaisedButton
          onClick={this.props.onSubmit(this.getAggregationLength())}
          primary={true}
          label="SUBMIT"
        />
      </div>
    )
  }
}

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
    // Don't create new Graph object if it was already created
    // update it instead
    if (this.graph) {

      // update it only if something changed
      if (this.props.data !== nextProps.data
          || this.props.labels !== nextProps.labels
          || this.props.visibility !== nextProps.visibility) {

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
      begin,
      end,
      live: true
    })
    this.state = {
      dataRange: initDataRange,
      aggregationLength: 60,
      requestDataRange: fromJS({}),
      requestAggregationLength: null,
      chartRequestId: null,
      chartRequestData: null,
      data: [],
      labels: [],
      visibility: [],
      showDatePickers: false,
      showAggregationPicker: false,
      activeDataRangeButton: DATA_RANGE_LIVE,
      activeAggregationButton: AGGREGATION_1M
    }
    this.onDataRangeChange = this.onDataRangeChange.bind(this)
    this.onAggregationChange = this.onAggregationChange.bind(this)
    this.onDataRangeSubmit = this.onDataRangeSubmit.bind(this)
    this.onAggregationSubmit = this.onAggregationSubmit.bind(this)

    this.updateSubscriptions = this.updateSubscriptions.bind(this)
    this.updateLabels = this.updateLabels.bind(this)
    this.updateVisibility = this.updateVisibility.bind(this)
    this.updateAll = this.updateAll.bind(this)
  }

  // maps Luminis data chart to format needed by Dygraphs
  makeData(chartData) {
    // we don't want to change data stored inside RequestManager so
    // make our own copy
    let newData = chartData.slice()
    for (var i = 0; i < chartData.length; ++i) {
      // Luminis data is array of arrays so we also need to copy
      // internal arrays
      newData[i] = newData[i].slice()
      // Dygraphs exptects Date object so we're converting timestamp here
      newData[i][0] = new Date(newData[i][0]  * 1000)
    }
    return newData
  }


  // create labels expected by Dygraphs
  makeLabels(measurementDataMap){
    let newLabels = []
    // first element in point's array is always time
    newLabels.push("Time")
    measurementDataMap.forEach((measurementId) => {
      newLabels.push(this.props.measurementNameGetter(measurementId.toString()))
    })
    return newLabels
  }

  // create table of visibility (bool values) expected by Dygraphs
  makeVisibility(measurementIds, measurementIdsShown) {
    let newVisibility = []
    // time is always visible and Dygraphs doesn't expect value for time
    measurementIds.forEach((measurementId) => {
      newVisibility.push(measurementIdsShown.get(measurementId))
    })
    return newVisibility
  }

  makeRequest(nodeId, measurementIds, dataRange, aggregationLength) {
    let requestedData = measurementIds.map((measurementId) => Object({measurement_id: measurementId})).toJS()
    let beginTs = Math.floor(dataRange.get('begin').valueOf() / 1000)
    let endTs = Math.floor(dataRange.get('end').valueOf() / 1000)
    let updateData = dataRange.get('live')
    let aggregationType = 'mean'
    return requestNewChart(
              parseInt(nodeId, 10),
              requestedData,
              beginTs,
              endTs,
              updateData,
              aggregationLength,
              aggregationType)
  }

  updateSubscriptions(newMeasurementIds, newDataRange, newAggregationLength) {
    if (this.state.chartRequestId) {
      this.props.dispatch(cancelRequest(this.state.chartRequestId))
    }

    let newChartRequest =
      this.makeRequest(this.props.params.nodeId, newMeasurementIds, newDataRange, newAggregationLength)
    this.props.dispatch(newChartRequest)

    this.setState({
      chartRequestId: newChartRequest.message.request_id,
      requestDataRange: newDataRange,
      requestAggregationLength: newAggregationLength,
    })
  }

  updateLabels(newMeasurementIds) {
    this.setState({
      labels: this.makeLabels(newMeasurementIds)
    })
  }

  updateVisibility(newMeasurementIds, newMeasurementIdsShown) {
    this.setState({
      visibility: this.makeVisibility(newMeasurementIds, newMeasurementIdsShown)
    })
  }

  updateAll(newMeasurementIds, newMeasurementIdsShown, newRequestDataRange, newAggregationLength) {
    this.updateSubscriptions(newMeasurementIds, newRequestDataRange, newAggregationLength)
    this.updateLabels(newMeasurementIds)
    this.updateVisibility(newMeasurementIds, newMeasurementIdsShown)
  }

  // Subscribe to live data on mount
  componentWillMount() {
    this.updateAll(
      this.props.measurementIds,
      this.props.measurementIdsShown,
      this.state.dataRange,
      this.state.aggregationLength)
  }

  componentWillUnmount() {
    this.props.dispatch(cancelRequest(this.state.chartRequestId))
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.measurementIds.equals(nextProps.measurementIds)) {
      this.updateAll(
        nextProps.measurementIds,
        nextProps.measurementIdsShown,
        this.state.dataRange,
        this.state.aggregationLength)
    } else if (!this.props.measurementIdsShown.equals(nextProps.measurementIdsShown)) {
      this.updateVisibility(nextProps.measurementIds, nextProps.measurementIdsShown)
    }

    let request = nextProps.activeRequests.get(this.state.chartRequestId)
    let newChartRequestData = null
    if (request && request.get('state') !== PENDING_STATE) {
      newChartRequestData = request.get('data').plot_data
    }

    if (newChartRequestData && this.state.chartRequestData !== newChartRequestData) {
      this.setState({chartRequestData: newChartRequestData, data: this.makeData(newChartRequestData)})
    }
  }

  onDataRangeChange = (button, begin, end, live, showDatePickers) => () => {
    if (begin && end) {
      let newDataRange = fromJS({
        begin,
        end,
        live
      })
      this.setState({dataRange: newDataRange, activeDataRangeButton: button, showDatePickers})
      this.updateAll(
        this.props.measurementIds,
        this.props.measurementIdsShown,
        newDataRange, this.state.aggregationLength)
    } else {
      this.setState({activeDataRangeButton: button, showDatePickers})
    }
  }

  onDataRangeSubmit = (newBegin, newEnd) => () => {
    let newDataRange = this.state.dataRange
    newDataRange = newDataRange.set('begin', newBegin).set('end', newEnd).set('live', false)
    this.setState({dataRange: newDataRange})
    this.updateAll(
      this.props.measurementIds,
      this.props.measurementIdsShown,
      this.state.dataRange,
      this.state.aggregationLength)
  }

  onAggregationSubmit = (newAggregationLength) => () => {
    this.setState({aggregationLength: newAggregationLength})
    this.updateAll(
      this.props.measurementIds,
      this.props.measurementIdsShown,
      this.state.dataRange,
      newAggregationLength)
  }


  onAggregationChange = (newActiveAggregationButton, newAggregationLength, showAggregationPicker) => () => {
    if (newAggregationLength) {
      this.setState({
        aggregationLength: newAggregationLength,
        activeAggregationButton: newActiveAggregationButton,
        showAggregationPicker })
      this.updateAll(
        this.props.measurementIds,
        this.props.measurementIdsShown,
        this.state.dataRange,
        newAggregationLength)
    } else {
      this.setState({ activeAggregationButton: newActiveAggregationButton, showAggregationPicker })
    }
  }

  render() {
    const nodeMetadata = this.props.nodesMetadata.get(this.props.params.nodeId)
    return (
      <Card>
        <CardTitle title={nodeMetadata.get('name')}/>
        <CardText>
          <div>
            <Graph data={this.state.data} labels={this.state.labels} visibility={this.state.visibility}/>
            {
              this.state.showDatePickers &&
                <DatePickerBar
                  begin={this.state.dataRange.get('begin')}
                  end={this.state.dataRange.get('end')}
                  onSubmit={this.onDataRangeSubmit}
                />
            }
            <p>Data Range</p>
            <RaisedButton
              onClick={this.onDataRangeChange(
                        DATA_RANGE_LIVE,
                        (new MomentDate()).subtract(1, 'day'),
                        new MomentDate(),
                        true,
                        false)}
              primary={this.state.activeDataRangeButton === DATA_RANGE_LIVE}
              label="LIVE"
            />
            <RaisedButton
              onClick={this.onDataRangeChange(
                        DATA_RANGE_1D,
                        (new MomentDate()).subtract(1, 'day'),
                        new MomentDate(),
                        false,
                        false)}
              primary={this.state.activeDataRangeButton === DATA_RANGE_1D}
              label="1D"
            />
            <RaisedButton
              onClick={this.onDataRangeChange(
                        DATA_RANGE_30D,
                        (new MomentDate()).subtract(30, 'day'),
                        new MomentDate(),
                        false,
                        false)}
              primary={this.state.activeDataRangeButton === DATA_RANGE_30D}
              label="30D"
            />
            <RaisedButton
              onClick={this.onDataRangeChange(
                        DATA_RANGE_1Y,
                        (new MomentDate()).subtract(1, 'year'),
                        new MomentDate(),
                        false,
                        false)}
              primary={this.state.activeDataRangeButton === DATA_RANGE_1Y}
              label="1Y"
            />
            <RaisedButton
              onClick={this.onDataRangeChange(DATA_RANGE_CUSTOM, null, null, false, true)}
              primary={this.state.activeDataRangeButton === DATA_RANGE_CUSTOM}
              label="CUSTOM"
            />
          </div>
          <div>
            <p>Aggregation</p>
            <RaisedButton
              onClick={this.onAggregationChange(AGGREGATION_1M, 60, false)}
              primary={this.state.activeAggregationButton === AGGREGATION_1M}
              label="1M"
            />
            <RaisedButton
              onClick={this.onAggregationChange(AGGREGATION_30M, 30 * 60, false)}
              primary={this.state.activeAggregationButton === AGGREGATION_30M}
              label="30M"
            />
            <RaisedButton
              onClick={this.onAggregationChange(AGGREGATION_24H, 24 * 60 * 60, false)}
              primary={this.state.activeAggregationButton === AGGREGATION_24H}
              label="24H"
            />
            <RaisedButton
              onClick={this.onAggregationChange(AGGREGATION_CUSTOM, null, true)}
              primary={this.state.activeAggregationButton === AGGREGATION_CUSTOM}
              label="CUSTOM"
            />
            {
              this.state.showAggregationPicker &&
                <AggregationPickerBar
                  aggregationLength={this.state.aggregationLength}
                  onSubmit={this.onAggregationSubmit}
                />
            }
          </div>
        </CardText>
      </Card>
    )
  }
}

export default ChartCard
