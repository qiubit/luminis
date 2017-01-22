import React from 'react';
import { connect } from 'react-redux'

import { connectWebsocket, processData } from './actions'
import config from './config'

export class WebsocketConnection extends React.Component {
  componenDidMount() {
    this.props.connectWebsocket();
  }

  render() {
    return <div></div>
  }
}

let url = config.url;

let websocketOnOpen = () => {
  console.log('Websocket connected');
};

let websocketOnMessage = (dispatch) => (evt) => {
  dispatch(processData(evt.data));
};

let websocketOnClose = (dispatch) => () => {
  console.log('Websocket disconnected');
  dispatch(
    connectWebsocket(
      url,
      websocketOnOpen,
      websocketOnMessage(dispatch),
      websocketOnClose(dispatch)
    )
  );
};

const mapDispatchToProps = (dispatch) => {
  return {
    connectWebsocket: dispatch(
                        connectWebsocket(
                          url,
                          websocketOnOpen,
                          websocketOnMessage(dispatch),
                          websocketOnClose(dispatch)
                        )
                      )
    }
}

export default connect(null, mapDispatchToProps)(WebsocketConnection);
