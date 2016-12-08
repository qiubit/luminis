import React from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Drawer from 'material-ui/Drawer';
import {ListItem, List} from 'material-ui/List';
import darkBaseTheme from 'material-ui/styles/baseThemes/darkBaseTheme';
import AppBar from 'material-ui/AppBar';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import injectTapEventPlugin from 'react-tap-event-plugin';

import LandingPage from './LandingPage'
import MapPage from './MapPage'
import TreeListItem from './TreeListItem'

// Needed for buttons to react on user tap
injectTapEventPlugin();

function PageToRender(props) {
  // pageId is its position in drawer
  switch(props.pageId) {
    // LandingPage is not in drawer, so it gets -1
    case -1:
      return <LandingPage />
    case 0:
      return <MapPage />
    default:
      return <LandingPage />
  }
}

class AppPage extends React.Component {

  constructor(props) {
    super(props);
    this.state = {pageId: -1, drawerOpen: false};
  }

  handleDrawerToggle = () => this.setState({drawerOpen: !this.state.drawerOpen});

  handleDrawerOpen = () => this.setState({drawerOpen: true});

  handleDrawerClose = () => this.setState({drawerOpen: false});

  handleMapOpen = () => this.setState({pageId: 0})
  handleLandingOpen = () => this.setState({pageId: -1})

  render() {
    return(
      <div>
        <AppBar
          title="Luminis"
          onLeftIconButtonTouchTap={this.handleDrawerToggle}
        />
        <Drawer
          docked={this.state.pageId !== -1}
          width={200}
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
            <ListItem onTouchTap={this.handleMapOpen}>Mapdaskdlns</ListItem>
            <TreeListItem />
          </List>
        </Drawer>
        <PageToRender pageId={this.state.pageId} />
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
