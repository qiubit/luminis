/*
 * Copyright (C) 2017 Paweł Goliński
 * Copyright (C) 2017 Piotr Wiśniewski
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the LICENSE file for details.
 */


import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'

import { selectTreeListToggle } from './selectors'
import { selectTreeStructure, selectNodesMetadata } from '../App/selectors'
import { changeNodeToggle } from './actions'
import { changeActiveNodeId } from '../App/actions'
import TreeList from '../../components/TreeList/index'


const mapStateToProps = createStructuredSelector({
  isOpened: selectTreeListToggle,
  tree: selectTreeStructure,
  nodesMetadata: selectNodesMetadata
})

const mapDispatchToProps = (dispatch) => {
  return {
    handleNestedListToggle: (nodeId, nodeToggle) => (event) => {
      event.stopPropagation()
      dispatch(changeNodeToggle(nodeId, nodeToggle))
    },
    handleNodeClick: (nodeId) => () => dispatch(changeActiveNodeId(nodeId)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(TreeList)
