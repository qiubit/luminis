import React from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Drawer from 'material-ui/Drawer';
import MenuItem from 'material-ui/MenuItem';
import darkBaseTheme from 'material-ui/styles/baseThemes/darkBaseTheme';
import AppBar from 'material-ui/AppBar';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import injectTapEventPlugin from 'react-tap-event-plugin';

// Needed for buttons to react on user tap
injectTapEventPlugin();

const styles = {
  container: {
    textAlign: 'center',
    paddingTop: 200,
  },
};

class LandingPage extends React.Component {

  constructor(props) {
    super(props);
    this.state = {drawerOpen: false};
  }

  handleDrawerToggle = () => this.setState({drawerOpen: !this.state.drawerOpen});

  handleDrawerClose = () => this.setState({drawerOpen: false});

  render() {
    return (
      <div>
        <AppBar
          title="Luminis"
          onLeftIconButtonTouchTap={this.handleDrawerToggle}
        />
        <Drawer
          docked={false}
          width={200}
          open={this.state.drawerOpen}
          onRequestChange={(drawerOpen) => this.setState({drawerOpen})}
        >
          <AppBar
            title="Luminis"
            showMenuIconButton={false}
          />
          <MenuItem onTouchTap={this.handleDrawerClose}>Map</MenuItem>
        </Drawer>
        <div style={styles.container}>
          <h1>Welcome to Luminis!</h1>
          <h3>Select option from menu above</h3>
        </div>
      </div>
    );
  }
}


const App = () => (
  <MuiThemeProvider muiTheme={getMuiTheme(darkBaseTheme)}>
    <LandingPage />
  </MuiThemeProvider>
);

export default App;