/*
 * Copyright (C) 2017 Paweł Goliński
 * Copyright (C) 2017 Piotr Wiśniewski
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the LICENSE file for details.
 */


import React from 'react'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import Drawer from 'material-ui/Drawer'
import { List } from 'material-ui/List'
import darkBaseTheme from 'material-ui/styles/baseThemes/darkBaseTheme'
import AppBar from 'material-ui/AppBar'
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import injectTapEventPlugin from 'react-tap-event-plugin'
import { createStructuredSelector } from 'reselect'
import { connect } from 'react-redux';
import { push } from 'react-router-redux'
import NavigationBack from 'material-ui/svg-icons/navigation/arrow-back'
import NavigationMenu from 'material-ui/svg-icons/navigation/menu'
import IconButton from 'material-ui/IconButton'

import TreeList from '../TreeList/index'
import config from './config'
import { selectDrawerOpen, selectTreeStructure } from './selectors'
import { drawerToggle, drawerChange, changeActiveSubtree } from './actions'
import { MAP_URL } from '../MapPage/constants'


// Needed for buttons to react on user tap
injectTapEventPlugin()

class AppPage extends React.Component {
  render() {
    const currentPath = this.props.location.pathname
    return(
      <div>
        <AppBar
          title="Luminis"
          onLeftIconButtonTouchTap={
            currentPath !== MAP_URL ?
            this.props.onReturnToMap : this.props.onDrawerToggle
          }
          iconElementLeft={currentPath !== MAP_URL ?
            <IconButton><NavigationBack/></IconButton> : <IconButton><NavigationMenu/></IconButton>
          }
        />
        <Drawer
          width={config.drawerWidth}
          open={this.props.drawerOpen}
          onRequestChange={this.props.onRequestDrawerChange}
        >
          <AppBar
            title="Luminis"
            showMenuIconButton={true}
            onLeftIconButtonTouchTap={
              currentPath !== MAP_URL ?
              this.props.onReturnToMap : this.props.onDrawerToggle
            }
            iconElementLeft={currentPath !== MAP_URL ?
              <IconButton><NavigationBack/></IconButton> : <IconButton><NavigationMenu/></IconButton>
            }
          />
          <List>
            <TreeList/>
          </List>
        </Drawer>
        {this.props.children}
      </div>
    )
  }
}

const App = (props) => (
  <MuiThemeProvider muiTheme={getMuiTheme(darkBaseTheme)}>
    <AppPage {...props} />
  </MuiThemeProvider>
)

function mapDispatchToProps(dispatch) {
  return {
    onRequestDrawerChange: (drawerOpen) => dispatch(drawerChange(drawerOpen)),
    onDrawerToggle: () => dispatch(drawerToggle()),
    onTreeListNodeClick: (nodeId) => () => dispatch(changeActiveSubtree(nodeId)),
    onReturnToMap: () => dispatch(push(MAP_URL)),
  }
}

const mapStateToProps = createStructuredSelector({
  tree: selectTreeStructure,
  drawerOpen: selectDrawerOpen,
})

// Wrap the component to inject dispatch and state into it
export default connect(mapStateToProps, mapDispatchToProps)(App)
