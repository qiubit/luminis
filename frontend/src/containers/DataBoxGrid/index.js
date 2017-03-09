import React from 'react';
import { createStructuredSelector } from 'reselect';
import { connect } from 'react-redux';
import AbsoluteGrid from 'react-absolute-grid';

import DataBox from '../DataBox/index'
import DataBoxManager from '../DataBoxManager/index'
import { selectDataBoxes } from './selectors'
import { selectDrawerOpen } from '../App/selectors'

// AbsoluteGrid provides "our" props in props.item
// it provides also other parameters i.e. position in grid but we're not
// using them now
function DataBoxWrapper(props) {
  return (<DataBox {...props.item} />)
}

function DataBoxGrid(props){
      return (
        <div style={{marginLeft: props.isDrawerOpen ? 200 : 0}}>
        <DataBoxManager/>
        <AbsoluteGrid
              itemWidth={310}
              itemHeight={240}
              dragEnabled={false}
              responsive={true}
              items={props.dataBoxes}
              verticalMargin={20}
              displayObject={<DataBoxWrapper />}
        />
        </div>
      );
}

const mapStateToProps = createStructuredSelector({
  dataBoxes: selectDataBoxes,
  isDrawerOpen: selectDrawerOpen
});

export default connect(mapStateToProps)(DataBoxGrid);
