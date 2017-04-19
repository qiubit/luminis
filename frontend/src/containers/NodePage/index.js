import React from 'react';
import MediaQuery from 'react-responsive';
import { connect } from 'react-redux';

import { Card, CardTitle, CardText } from 'material-ui/Card';
import { List, ListItem } from 'material-ui/List';
import Paper from 'material-ui/Paper';
import Subheader from 'material-ui/Subheader';
import Checkbox from 'material-ui/Checkbox'

import {
  selectDrawerOpen,
  selectNodesMetadata,
  selectNodeName,
  selectNodeMeasurements,
  selectMeasurementName,
} from '../App/selectors';
import { drawerChange } from '../App/actions';
import ChartCard from '../ChartCard/index'
import {
  selectShownMeasurements
} from './selectors'
import {
  showMeasurement,
  hideMeasurement,
  changeShownMeasurements,
} from './actions'

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
    };
    const rightBarStyle = {
      width: 200,
      height: "100vh",
      margin: 0,
      textAlign: 'left',
      display: 'inline-block',
      float: 'right',
    }

    // Render error panel if node metadata was not found
    const nodeMetadata = this.props.nodesMetadata.get(this.props.params.nodeId);
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

    const RightBar = (props) => (
      <List>
        <Subheader>{nodeMetadata.get("name")}</Subheader>
        {props.measurementIds &&
          props.measurementIds.map((id) =>
            <ListItem
              leftCheckbox={
                <Checkbox
                  checked={this.props.measurementIdsShown.get(id)}
                  onClick={this.props.measurementIdsShown.get(id) ?
                    this.props.onHideMeasurement(id) : this.props.onShowMeasurement(id)}
                />
              }
              key={id}
              primaryText={props.measurementNameGetter(id.toString())}
            />)
        }
      </List>
    )

    return (
      <div>
        <MediaQuery minWidth={1050}>
          <Paper style={rightBarStyle} zDepth={3}>
            <RightBar {...this.props}/>
          </Paper>
          <Paper style={chartStyle} zDepth={3}>
            <ChartCard/>
          </Paper>
        </MediaQuery>
        <MediaQuery maxWidth={1049}>
          <Paper zDepth={3}>
            <RightBar {...this.props}/>
          </Paper>
          <Paper zDepth={3} style={{ margin: 20 }}>
            <ChartCard/>
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
    onChangeShownMeasurements: (measurementIds) => dispatch(changeShownMeasurements(measurementIds)),
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
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(NodePage)
