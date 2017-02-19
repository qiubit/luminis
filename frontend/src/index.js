/**
 * index.js
 *
 * This is the entry file for the application, contains all setup code.
 */

// Needed by redux-saga to support older browsers
import 'babel-polyfill';

import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { Router, browserHistory, IndexRoute, Route } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';
import configureStore from './store';
import './index.css';

// Create store enchanced with history
const initialState = {};
const store = configureStore(initialState, browserHistory);

// Sync history and store, as the react-router-redux reducer
// is under the non-default key, selectLocationState must be
// provided for resolving how to retrieve the "route" in the state
import { selectLocationState } from './containers/App/selectors';
const history = syncHistoryWithStore(browserHistory, store, {
  selectLocationState: selectLocationState(),
});

import App from './containers/App/index';
import LandingPage from './components/LandingPage/index';
import MapPage from './containers/MapPage/index';
import WebsocketConnection from './containers/WebsocketConnection/index';
import TreeProvider from './containers/TreeProvider/index';
import { MAP_URL } from './containers/MapPage/constants';
import config from './config'

ReactDOM.render(
  (
    <Provider store={store}>
      <div>
        <TreeProvider url={config.apiUrl} refreshTime={config.fetchTreeRefreshTime}/>
        <Router history={history}>
          <Route path="/" component={App}>
            <IndexRoute component={LandingPage}/>
            <Route path={MAP_URL} component={MapPage}/>
          </Route>
        </Router>
      </div>
    </Provider>
  ),
  document.getElementById('root')
);
