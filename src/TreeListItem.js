import React from 'react';
import ListItem from 'material-ui/List/ListItem';
import OpenIcon from 'material-ui/svg-icons/navigation/chevron-right';
import CloseIcon from 'material-ui/svg-icons/navigation/expand-more';
import IconButton from 'material-ui/IconButton'

class TreeListItem extends React.Component {
  constructor(props) {
    super(props);
    this.tree = props.tree;
    this.state = {};

    var generateState = function(nodes) {
      if (nodes) {
        nodes.forEach((node) => {
          generateState(node.children);
          this.state[node.id] = {}; // eslint-disable-line react/no-direct-mutation-state
          this.state[node.id]['open'] = false; // eslint-disable-line react/no-direct-mutation-state
        });
      }
    }
    generateState = generateState.bind(this);

    generateState(this.tree);
  }

  // Generate unique event handler for each node
  handleNestedListToggle = (nodeId) => (event) => {

    // Avoid passing left icon click to ListItem
    event.stopPropagation();

    let newState = {}
    newState[nodeId] = {}
    newState[nodeId]['open'] = !this.state[nodeId]['open'];
    this.setState(newState);
  }

  mapStructure = (nodes) => {
    if (nodes) {
      return nodes.map(node => (
            <ListItem
              key={node.id}
              nestedItems={this.mapStructure(node.children)}
              autoGenerateNestedIndicator={false}
              open={this.state[node.id]['open']}
            >
              <IconButton
                style={{position: 'absolute', display: 'block', top: 0, left: 4}}
                onTouchTap={this.handleNestedListToggle(node.id)}
              >
                {node.children.length > 0 ?
                (this.state[node.id]['open'] ? <CloseIcon/> : <OpenIcon/>)
                : null}
              </IconButton>
              <span
                style={{marginLeft: node.children.length > 0 ? 30 : 0}}
              >
                {node.primaryText}
              </span>
            </ListItem>
        ));
      }
  }

  render() {
    return(
      <div>
        {this.mapStructure(this.tree)}
      </div>
    );
  }
}

export default TreeListItem;
