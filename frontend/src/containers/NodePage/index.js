import React from 'react';
import MediaQuery from 'react-responsive';
import { createStructuredSelector } from 'reselect';
import { connect } from 'react-redux';

import { Card, CardTitle, CardText } from 'material-ui/Card';
import { List, ListItem } from 'material-ui/List';
import Paper from 'material-ui/Paper';
import Subheader from 'material-ui/Subheader';

import { selectDrawerOpen } from '../App/selectors';

class NodePage extends React.Component {
    render() {
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
      return (
        <div>
          <MediaQuery minWidth={1050}>
            <Paper style={rightBarStyle} zDepth={3}>
              <List>
                <Subheader>Node name</Subheader>
                <ListItem primaryText="Measurement1"/>
                <ListItem primaryText="Measurement2"/>
                <ListItem primaryText="Measurement3"/>
                <ListItem primaryText="Measurement4"/>
              </List>
            </Paper>
            <Paper style={chartStyle} zDepth={3}>
              <Card>
                <CardTitle title="Chart"/>
                <CardText>
                  Chart placeholder
                </CardText>
              </Card>
            </Paper>
          </MediaQuery>
          <MediaQuery maxWidth={1049}>
            <Paper zDepth={3}>
              <List>
                <Subheader>Node name</Subheader>
                <ListItem primaryText="Measurement1"/>
                <ListItem primaryText="Measurement2"/>
                <ListItem primaryText="Measurement3"/>
                <ListItem primaryText="Measurement4"/>
              </List>
            </Paper>
            <Paper zDepth={3} style={{ margin: 20 }}>
              <Card>
                <CardTitle title="Chart"/>
                <CardText>
                  Chart placeholder
                </CardText>
              </Card>
            </Paper>
          </MediaQuery>
        </div>
      )
    }
}

const mapStateToProps = createStructuredSelector({
  drawerOpen: selectDrawerOpen,
});

export default connect(mapStateToProps)(NodePage);