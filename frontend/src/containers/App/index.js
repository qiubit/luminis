import React from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Drawer from 'material-ui/Drawer';
import { ListItem, List } from 'material-ui/List';
import darkBaseTheme from 'material-ui/styles/baseThemes/darkBaseTheme';
import AppBar from 'material-ui/AppBar';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import injectTapEventPlugin from 'react-tap-event-plugin';
import { push } from 'react-router-redux';
import { createStructuredSelector } from 'reselect';
import { connect } from 'react-redux';

import TreeList from '../TreeList/index'
import { MAP_URL } from '../MapPage/constants';
import config from './config';
import { selectDrawerOpen, selectDataTree } from './selectors';
import { drawerToggle, drawerChange, changeActiveSubtree } from './actions';


// Needed for buttons to react on user tap
injectTapEventPlugin();

class AppPage extends React.Component {
  render() {
    return(
      <div>
        <AppBar
          title="Luminis"
          onLeftIconButtonTouchTap={this.props.onDrawerToggle}
        />
        <Drawer
          width={config.drawerWidth}
          open={this.props.drawerOpen}
          onRequestChange={this.props.onRequestDrawerChange}
        >
          <AppBar
            title="Luminis"
            showMenuIconButton={true}
            onLeftIconButtonTouchTap={this.props.onDrawerToggle}
          />
          <List>
            <ListItem onTouchTap={this.props.onMapOpen}>Map</ListItem>
            <TreeList/>
          </List>
        </Drawer>
        {this.props.children}
      </div>
    );
  }
}

const App = (props) => (
  <MuiThemeProvider muiTheme={getMuiTheme(darkBaseTheme)}>
    <AppPage {...props} />
  </MuiThemeProvider>
);

function mapDispatchToProps(dispatch) {
  return {
    onRequestDrawerChange: (drawerOpen) => dispatch(drawerChange(drawerOpen)),
    onDrawerToggle: () => dispatch(drawerToggle()),
    onMapOpen: () => dispatch(push(MAP_URL)),
    onTreeListNodeClick: (nodeId) => () => dispatch(changeActiveSubtree(nodeId)),
  };
}

const mapStateToProps = createStructuredSelector({
  tree: selectDataTree,
  drawerOpen: selectDrawerOpen,
});

// Wrap the component to inject dispatch and state into it
export default connect(mapStateToProps, mapDispatchToProps)(App);
