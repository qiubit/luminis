import React from 'react';
import ReactDOM from 'react-dom';
import App from './containers/App/index';
import WebsocketConnection from './containers/WebsocketConnection/index';
import { Provider } from 'react-redux';
import configureStore from './store';
import './index.css';

const initialState = {};
const store = configureStore(initialState);

ReactDOM.render(
  <Provider store={store}>
    <div>
      <WebsocketConnection />
      <App />
    </div>
  </Provider>,
  document.getElementById('root')
);
