import { createStore, applyMiddleware, compose } from 'redux';
import { fromJS } from 'immutable';
import { routerMiddleware } from 'react-router-redux';
import createSagaMiddleware from 'redux-saga';
import createReducer from './reducers';
import websocketSagas from './containers/WebsocketConnection/sagas';
import treeProviderSagas from './containers/TreeProvider/sagas';
import appSagas from './containers/App/sagas';
import dataBoxManagerSagas from './containers/DataBoxManager/sagas'
import chartManagerSagas from './containers/ChartManager/sagas'


const sagaMiddleware = createSagaMiddleware();

export default function configureStore(initialState = {}, history) {
  // Create the store with two middlewares
  // 1. sagaMiddleware: Makes redux-sagas work
  // 2. routerMiddleware: Syncs the location/URL path to the state
  const middlewares = [
    sagaMiddleware,
    routerMiddleware(history),
  ];

  const enhancers = [
    applyMiddleware(...middlewares),
  ];

  // If Redux DevTools Extension is installed use it, otherwise use Redux compose
  /* eslint-disable no-underscore-dangle */
  const composeEnhancers =
    typeof window === 'object' &&
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ?
      window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ : compose;
  /* eslint-enable */

  const store = createStore(
    createReducer(),
    fromJS(initialState),
    composeEnhancers(...enhancers)
  );

  // Extensions
  store.runSaga = sagaMiddleware.run;

  websocketSagas.map(store.runSaga);
  treeProviderSagas.map(store.runSaga);
  appSagas.map(store.runSaga);
  dataBoxManagerSagas.map(store.runSaga);
  chartManagerSagas.map(store.runSaga);

  return store;
}
