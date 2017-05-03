import React from 'react'
import { createStructuredSelector } from 'reselect'
import { connect } from 'react-redux'
import ReactPaginate from 'react-paginate'

import DataBox from '../DataBox/index'
import { selectDrawerOpen, selectActiveSubtree } from '../App/selectors'

import './index.css'

class DataBoxGrid extends React.Component {
  constructor(props) {
    super(props)
    this.state = ({ offset: 0 })
    this.handlePageClick = this.handlePageClick.bind(this)
  }

  handlePageClick = (data) => {
    let selected = data.selected
    let offset = Math.ceil(selected * this.props.perPage)
    this.setState({ offset })
  }

  render() {
    let nodeCount = null
    let shownNodes = []
    const activeSubtree = this.props.activeSubtree.get(0)
    if (activeSubtree) {
      shownNodes.push(activeSubtree.get('node_id'))
      if (activeSubtree.get('children')) {
        activeSubtree.get('children').forEach((childTree) => {
          shownNodes.push(childTree.get('node_id'))
        })
      }
      nodeCount = shownNodes.length
      shownNodes = shownNodes.filter((element, index) => {
        return index >= this.state.offset && index < this.state.offset + this.props.perPage
      })
    }
    const pageCount = nodeCount ? nodeCount / this.props.perPage : 0
    const currentPage = this.state.offset / this.props.perPage + 1
    return (
      <div style={{marginLeft: this.props.isDrawerOpen ? 200 : 0}}>
        {shownNodes.map((nodeId) => <DataBox key={nodeId} nodeId={nodeId}/>)}
        {nodeCount &&
          <div className="pagination">
            <ReactPaginate
              previousLabel={"previous"}
              nextLabel={"next"}
              breakLabel={<a href="">...</a>}
              pageCount={pageCount}
              marginPagesDisplayed={2}
              pageRangeDisplayed={5}
              onPageChange={this.handlePageClick}
              pageClassName={"page"}
              previousClassName={this.state.offset === 0 ? "disabled page" : "page"}
              nextClassName={currentPage >= pageCount ? "disabled page" : "page"}
              breakClassName={"page"}
              activeClassName={"page-active"}
              containerClassName={"pagination-list"}
              pageLinkClassName={"page-link"}
              previousLinkClassName={"page-link"}
              nextLinkClassName={"page-link"}
            />
          </div>
        }
      </div>
    )
  }
}

const mapStateToProps = createStructuredSelector({
  isDrawerOpen: selectDrawerOpen,
  activeSubtree: selectActiveSubtree,
})

export default connect(mapStateToProps)(DataBoxGrid)
