import React from 'react';
import { connect } from 'react-redux'

import { connectWebsocket, processData } from './actions'

export class WebsocketConnection extends React.Component {
  componentDidMount() {
    this.props.connectWebsocket();
  }

  render() {
    return null;
  }
}

let websocketOnOpen = () => {
  console.log('Websocket connected');
};

let websocketOnMessage = (dispatch) => (evt) => {
  dispatch(processData(evt.data));
};

let websocketOnClose = (dispatch, url) => () => {
  console.log('Websocket disconnected');
  dispatch(
    connectWebsocket(
      url,
      websocketOnOpen,
      websocketOnMessage(dispatch),
      websocketOnClose(dispatch, url)
    )
  );
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    connectWebsocket: () => dispatch(
                              connectWebsocket(
                                ownProps.url,
                                websocketOnOpen,
                                websocketOnMessage(dispatch),
                                websocketOnClose(dispatch, ownProps.url)
                              )
                            )
    }
}

export default connect(null, mapDispatchToProps)(WebsocketConnection);
