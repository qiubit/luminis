import React from 'react';
import { connect } from 'react-redux'

import { downloadTree } from './actions'

export class TreeProvider extends React.Component {
  componentDidMount() {
    this.props.downloadTree(this.props.url);
    let refreshTimeInMs = this.props.refreshTime * 1000;
    this.intervalId = setInterval(() => this.props.downloadTree(this.props.url), refreshTimeInMs);
  }

  componentWillUnmount() {
    clearInterval(this.intervalId);
  }

  render() {
    return <div></div>
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    downloadTree: (url) => dispatch(downloadTree(url))
  }
}

export default connect(null, mapDispatchToProps)(TreeProvider);
