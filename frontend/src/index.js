/*
 * Copyright (C) 2017 Paweł Goliński
 * Copyright (C) 2017 Piotr Wiśniewski
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the LICENSE file for details.
 */


/**
 * index.js
 *
 * This is the entry file for the application, contains all setup code.
 */

// Needed by redux-saga to support older browsers
import 'babel-polyfill'

import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { Router, browserHistory, IndexRedirect, Route, Redirect } from 'react-router'
import { syncHistoryWithStore } from 'react-router-redux'
import configureStore from './store'
import './index.css'

// Create store enchanced with history
const initialState = {}
const store = configureStore(initialState, browserHistory)

// Sync history and store, as the react-router-redux reducer
// is under the non-default key, selectLocationState must be
// provided for resolving how to retrieve the "route" in the state
import { selectLocationState } from './containers/App/selectors'
const history = syncHistoryWithStore(browserHistory, store, {
  selectLocationState: selectLocationState(),
})

// Setup websocket connection
import { setupWebsocket } from './containers/WebsocketConnection/websocket'
setupWebsocket(store.dispatch)

import App from './containers/App/index'
import MapPage from './containers/MapPage/index'
import NodePage from './containers/NodePage/index'
import TreeProvider from './containers/TreeProvider/index'
import { MAP_URL } from './containers/MapPage/constants'
import { NODE_ID_URL } from './containers/NodePage/constants'
import config from './config'

ReactDOM.render(
  (
    <Provider store={store}>
      <div>
        <TreeProvider
          timestampUrl={config.timestampUrl}
          treeUrl={config.treeUrl}
          refreshTime={config.fetchTreeRefreshTime}/>
        <Router history={history}>
          <Route path="/" component={App}>
            <IndexRedirect to={MAP_URL}/>
            <Route path={MAP_URL} component={MapPage}/>
            <Route path={NODE_ID_URL} component={NodePage}/>
            <Redirect from='*' to={MAP_URL}/>
          </Route>
        </Router>
      </div>
    </Provider>
  ),
  document.getElementById('root')
)
