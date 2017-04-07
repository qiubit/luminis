import React from 'react';
import MediaQuery from 'react-responsive';
import { createStructuredSelector } from 'reselect';
import { connect } from 'react-redux';

import { Card, CardTitle, CardText } from 'material-ui/Card';
import { List, ListItem } from 'material-ui/List';
import Paper from 'material-ui/Paper';
import Subheader from 'material-ui/Subheader';

import { selectDrawerOpen, selectNodesMetadata } from '../App/selectors';
import { drawerChange } from '../App/actions';

class NodePage extends React.Component {
  componentWillMount() {
    this.drawerCloseSignalSent = false;
  }

  render() {
    // Close drawer on first render (when user enters the page)
    if (!this.drawerCloseSignalSent) {
      this.props.sendCloseDrawer();
      this.drawerCloseSignalSent = true;
    }

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
          Chart placeholder
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
