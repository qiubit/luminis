import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect';

import { selectTreeListToggle } from './selectors'
import { selectTreeStructure } from '../App/selectors'
import { changeNodeToggle } from './actions'
import { changeActiveNodeId } from '../App/actions'
import TreeList from '../../components/TreeList/index'


const mapStateToProps = createStructuredSelector({
    isOpened: selectTreeListToggle,
    tree: selectTreeStructure
})

const mapDispatchToProps = (dispatch) => {
  return {
    handleNestedListToggle: (nodeId, nodeToggle) => (event) => {
      event.stopPropagation();
      dispatch(changeNodeToggle(nodeId, nodeToggle))
    },
    handleNodeClick: (nodeId) => () => dispatch(changeActiveNodeId(nodeId)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(TreeList);
