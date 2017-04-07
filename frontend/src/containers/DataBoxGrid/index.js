import React from 'react'
import { createStructuredSelector } from 'reselect'
import { connect } from 'react-redux'

import DataBox from '../DataBox/index'
import { selectDrawerOpen, selectActiveSubtree } from '../App/selectors'

function DataBoxGrid(props) {
  let activeNodes = []
  const activeSubtree = props.activeSubtree.get(0)
  if (activeSubtree) {
    activeNodes.push(activeSubtree.get('node_id'))
    if (activeSubtree.get('children')) {
      activeSubtree.get('children').forEach((childTree) => {
        activeNodes.push(childTree.get('node_id'))
      })
    }
  }
  return (
    <div style={{marginLeft: props.isDrawerOpen ? 200 : 0}}>
      {activeNodes.map((nodeId) => <DataBox key={nodeId} nodeId={nodeId}/>)}
    </div>
  )
}

const mapStateToProps = createStructuredSelector({
  isDrawerOpen: selectDrawerOpen,
  activeSubtree: selectActiveSubtree,
})

export default connect(mapStateToProps)(DataBoxGrid)
