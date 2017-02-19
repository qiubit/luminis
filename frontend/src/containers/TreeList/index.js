import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect';

import { selectTreeListToggle } from './selectors'
import { selectDataTree } from '../TreeProvider/selectors'
import { changeNodeToggle } from './actions'
import { changeActiveSubtree } from '../MapPage/actions'
import TreeList from '../../components/TreeList/index'


const mapStateToProps = createStructuredSelector({
    isOpened: selectTreeListToggle,
    tree: selectDataTree
})

const mapDispatchToProps = (dispatch) => {
  return {
    handleNestedListToggle: (nodeId, nodeToggle) => (event) => {
      event.stopPropagation();
      dispatch(changeNodeToggle(nodeId, nodeToggle))
    },
    handleNodeClick: (nodeId) => () => dispatch(changeActiveSubtree(nodeId)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(TreeList);
