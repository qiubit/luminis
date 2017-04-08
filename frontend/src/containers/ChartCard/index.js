import React from 'react'

import { Card, CardTitle, CardText } from 'material-ui/Card'
import RaisedButton from 'material-ui/RaisedButton'

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

class ChartCard extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      dataRange: DATA_RANGE_LIVE,
      aggregation: AGGREGATION_1M,
    }
    this.onDataRangeChange = this.onDataRangeChange.bind(this)
    this.onAggregationChange = this.onAggregationChange.bind(this)
  }

  onDataRangeChange = (dataRange) => () => {
    console.log("Time to change dataRange to " + dataRange)
    this.setState({ dataRange })
  }

  onAggregationChange = (aggregation) => () => {
    console.log("Time to change aggregation to " + aggregation)
    this.setState({ aggregation })
  }

  render() {
    return (
      <Card>
        <CardTitle title="Chart"/>
        <CardText>
          <div>
            <p>Data Range</p>
            <RaisedButton
              onClick={this.onDataRangeChange(DATA_RANGE_LIVE)}
              primary={this.state.dataRange === DATA_RANGE_LIVE}
              label="LIVE"
            />
            <RaisedButton
              onClick={this.onDataRangeChange(DATA_RANGE_1D)}
              primary={this.state.dataRange === DATA_RANGE_1D}
              label="1D"
            />
            <RaisedButton
              onClick={this.onDataRangeChange(DATA_RANGE_30D)}
              primary={this.state.dataRange === DATA_RANGE_30D}
              label="30D"
            />
            <RaisedButton
              onClick={this.onDataRangeChange(DATA_RANGE_1Y)}
              primary={this.state.dataRange === DATA_RANGE_1Y}
              label="1Y"
            />
            <RaisedButton
              onClick={this.onDataRangeChange(DATA_RANGE_MAX)}
              primary={this.state.dataRange === DATA_RANGE_MAX}
              label="MAX"
            />
            <RaisedButton
              onClick={this.onDataRangeChange(DATA_RANGE_CUSTOM)}
              primary={this.state.dataRange === DATA_RANGE_CUSTOM}
              label="CUSTOM"
            />
          </div>
          <div>
            <p>Aggregation</p>
            <RaisedButton
              onClick={this.onAggregationChange(AGGREGATION_1M)}
              primary={this.state.aggregation === AGGREGATION_1M}
              label="1M"
            />
            <RaisedButton
              onClick={this.onAggregationChange(AGGREGATION_30M)}
              primary={this.state.aggregation === AGGREGATION_30M}
              label="30M"
            />
            <RaisedButton
              onClick={this.onAggregationChange(AGGREGATION_24H)}
              primary={this.state.aggregation === AGGREGATION_24H}
              label="24H"
            />
            <RaisedButton
              onClick={this.onAggregationChange(AGGREGATION_CUSTOM)}
              primary={this.state.aggregation === AGGREGATION_CUSTOM}
              label="CUSTOM"
            />
          </div>
        </CardText>
      </Card>
    )
  }
}

export default ChartCard
