import { createStore, applyMiddleware } from 'redux';
import createSagaMiddleware from 'redux-saga';
import createReducer from './reducers';
import websocketSagas from './containers/WebsocketConnection/sagas';

const sagaMiddleware = createSagaMiddleware();

export default function configureStore(initialState = {}) {

  const store = createStore(
    createReducer(),
    initialState,
    applyMiddleware(sagaMiddleware)
  );

  store.runSaga = sagaMiddleware.run;

  websocketSagas.map(store.runSaga);

  return store;
}
