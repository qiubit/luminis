import React from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Drawer from 'material-ui/Drawer';
import {ListItem, List} from 'material-ui/List';
import darkBaseTheme from 'material-ui/styles/baseThemes/darkBaseTheme';
import AppBar from 'material-ui/AppBar';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import injectTapEventPlugin from 'react-tap-event-plugin';

import LandingPage from '../../components/LandingPage/index';
import MapPage from '../MapPage/index';
import TreeListItem from '../TreeListItem/index';

import sample_tree from './sample_tree';
import config from './config';


// Needed for buttons to react on user tap
injectTapEventPlugin();

function PageToRender(props) {
  // pageId is its position in drawer
  switch(props.pageId) {
    // LandingPage is not in drawer, so it gets -1
    case -1:
      return <LandingPage />
    case 0:
      return <MapPage position={props.position} tree={props.tree}/>
    default:
      return <LandingPage />
  }
}

class AppPage extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      pageId: -1,
      drawerOpen: false,
      mapPosition: sample_tree[0].position,
      activeTree: sample_tree,
    };
  }

  handleDrawerToggle = () => this.setState({drawerOpen: !this.state.drawerOpen});

  handleDrawerOpen = () => this.setState({drawerOpen: true});

  handleDrawerClose = () => this.setState({drawerOpen: false});

  handleMapOpen = () => this.setState({pageId: 0})
  handleLandingOpen = () => this.setState({pageId: -1})

  getSubTree(searched_id, tree) {
    for (var i = 0; i < tree.length; i++) {
      if (tree[i].id === searched_id) {
        return [tree[i]];
      }
      var res = this.getSubTree(searched_id, tree[i].children)
      if (res.length != 0) {
        return res;
      }
    }
    return [];
  }

  handleNodeClick = (id) => () => {
    var sub_tree = this.getSubTree(id, sample_tree);
    var position = this.state.mapPosition;
    if (sub_tree) {
      position = sub_tree[0].position;
    }
    this.setState({mapPosition: position, activeTree: sub_tree})
  }

  render() {
    return(
      <div>
        <AppBar
          title="Luminis"
          onLeftIconButtonTouchTap={this.handleDrawerToggle}
        />
        <Drawer
          docked={this.state.pageId !== -1}
          width={config.drawerWidth}
          open={this.state.drawerOpen}
          onRequestChange={(drawerOpen) => this.setState({drawerOpen})}
        >
          <AppBar
            title="Luminis"
            showMenuIconButton={true}
            onLeftIconButtonTouchTap={this.handleDrawerToggle}
          />
          <List>
            <ListItem onTouchTap={this.handleLandingOpen} nestedItems={this.generateTree}>LandingPage</ListItem>
            <ListItem onTouchTap={this.handleMapOpen}>Map</ListItem>
            <TreeListItem tree={sample_tree} handleNodeClick={this.handleNodeClick}/>
          </List>
        </Drawer>
        <PageToRender pageId={this.state.pageId} position={this.state.mapPosition} tree={this.state.activeTree}/>
      </div>
    );
  }
}

const App = () => (
  <MuiThemeProvider muiTheme={getMuiTheme(darkBaseTheme)}>
    <AppPage />
  </MuiThemeProvider>
);

export default App;
