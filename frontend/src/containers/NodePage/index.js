import React from 'react';
import MediaQuery from 'react-responsive';
import { createStructuredSelector } from 'reselect';
import { connect } from 'react-redux';

import { Card, CardTitle, CardText } from 'material-ui/Card';
import { List, ListItem } from 'material-ui/List';
import Paper from 'material-ui/Paper';
import Subheader from 'material-ui/Subheader';
import DatePicker from 'material-ui/DatePicker';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';

import { selectDrawerOpen, selectNodesMetadata } from '../App/selectors';
import { drawerChange } from '../App/actions';

class NodePage extends React.Component {
  componentWillMount() {
    this.props.sendCloseDrawer();
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
        <ListItem primaryText="Measurement1"/>
        <ListItem primaryText="Measurement2"/>
        <ListItem primaryText="Measurement3"/>
        <ListItem primaryText="Measurement4"/>
      </List>
    )
    const ChartCard = (props) => (
      <Card>
        <CardTitle title="Chart"/>
        <CardText>
          Data interval
          {/* using any of these controls should send new request to RequestManager */}
          <div>
            {/* default aggregations: */}
            {/* 1 minute (Live chart should show 1 day) */}
            <RaisedButton label="Live"/>
            {/* 1 minute */}
            <RaisedButton label="1D"/>
            {/* 30 minutes */}
            <RaisedButton label="1M"/>
            {/* 1 day */}
            <RaisedButton label="1Y"/>
            {/* 1 day */}
            <RaisedButton label="MAX"/>
            {/* 1 day (?) clicking should reveal date pickers */}
            <RaisedButton label="CUSTOM"/>
          </div>
          Custom interval picker
          <div>
            <DatePicker floatingLabelText="Custom interval start"/>
            <DatePicker floatingLabelText="Custom interval end"/>
          </div>
          Aggregation
          <div>
            <RaisedButton label="1m"/>
            <RaisedButton label="30m"/>
            <RaisedButton label="24h"/>
            <RaisedButton label="CUSTOM"/>
          </div>
          Custom aggregation picker
          <div>
            <TextField
              hintText="(e.g 1M, 5H, 4D)"
            />
          </div>
        </CardText>
      </Card>
    );

    return (
      <div>
        <MediaQuery minWidth={1050}>
          <Paper style={rightBarStyle} zDepth={3}>
            <RightBar/>
          </Paper>
          <Paper style={chartStyle} zDepth={3}>
            <ChartCard/>
          </Paper>
        </MediaQuery>
        <MediaQuery maxWidth={1049}>
          <Paper zDepth={3}>
            <RightBar/>
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
  }
}

const mapStateToProps = createStructuredSelector({
  drawerOpen: selectDrawerOpen,
  nodesMetadata: selectNodesMetadata,
});

export default connect(mapStateToProps, mapDispatchToProps)(NodePage);
