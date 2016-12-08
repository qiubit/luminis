import React from 'react';
import ListItem from 'material-ui/List/ListItem';
import OpenIcon from 'material-ui/svg-icons/navigation/chevron-right';
import CloseIcon from 'material-ui/svg-icons/navigation/expand-more'; // eslint-disable-line no-unused-vars

class TreeListItem extends React.Component {
  // Mock of a tree JSON
  tree = [{
    id: '1',
    primaryText: 'wezel 1',
    children: [
      {
        id: '2',
        primaryText: 'wezeliczeklol 2',
        children: [
          {
            id: '4',
            primaryText: 'wezeliczeklolololol 4',
            children: [
              {
                id: '5',
                primaryText: 'wezeliczeklollolol 5',
                children: [
                  {
                    id: '6',
                    primaryText: 'wezeliczeklollolol 6',
                    children: [],
                  }
                ],
              }
            ],
          }
        ],
      },
      {
        id: '3',
        primaryText: 'wezel 3',
        children: []
      }
    ]
  }]

  mapStructure = (nodes) => {
    if (nodes) {
      return nodes.map(node => (
            <ListItem
              key={node.id}
              primaryText={node.primaryText}
              nestedItems={this.mapStructure(node.children)}
              autoGenerateNestedIndicator={false}
              leftIcon={<OpenIcon />}
            />
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
