import React from 'react';
import ListItem from 'material-ui/List/ListItem';
import OpenIcon from 'material-ui/svg-icons/navigation/chevron-right';
import CloseIcon from 'material-ui/svg-icons/navigation/expand-more';
import IconButton from 'material-ui/IconButton'

function TreeList(props) {
  let mapStructure = (nodes) => {
    if (nodes) {
      return nodes.map(node => (
        <ListItem
          key={node.get('id')}
          nestedItems={mapStructure(node.get('children')).toJS()}
          autoGenerateNestedIndicator={false}
          open={props.isOpened.get(node.get('id'))}
          onClick={props.handleNodeClick(node.get('id'))}
        >
          <IconButton
            style={{position: 'absolute', display: 'block', top: 0, left: 4}}
            onTouchTap={props.handleNestedListToggle(node.get('id'), !props.isOpened.get(node.get('id')))}
          >
            {node.get('children').size > 0 ?
            (props.isOpened.get(node.get('id')) ? <CloseIcon/> : <OpenIcon/>)
            : null}
          </IconButton>
          <span
            style={{marginLeft: node.get('children').size > 0 ? 30 : 0}}
          >
            {node.get('primaryText')}
          </span>
        </ListItem>
      ));
    }
  }
  return(
    <div>
      {mapStructure(props.tree)}
    </div>
  );
}

export default TreeList
