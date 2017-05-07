/*
 * Copyright (C) 2017 Paweł Goliński
 * Copyright (C) 2017 Piotr Wiśniewski
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the LICENSE file for details.
 */


import React from 'react'
import { connect } from 'react-redux'

import { downloadTree } from './actions'

export class TreeProvider extends React.Component {
  componentDidMount() {
    this.props.downloadTree(this.props.timestampUrl, this.props.treeUrl)
    let refreshTimeInMs = this.props.refreshTime * 1000
    this.intervalId = setInterval(
      () => this.props.downloadTree(this.props.timestampUrl, this.props.treeUrl), refreshTimeInMs
    )
  }

  componentWillUnmount() {
    clearInterval(this.intervalId)
  }

  render() {
    return null
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    downloadTree: (timestampUrl, treeUrl) => dispatch(downloadTree(timestampUrl, treeUrl))
  }
}

export default connect(null, mapDispatchToProps)(TreeProvider)
