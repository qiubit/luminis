import React from 'react';
import { connect } from 'react-redux';
import { Map, Marker, Popup, TileLayer } from 'react-leaflet';
import { createStructuredSelector } from 'reselect';
import { fromJS } from 'immutable'


import config from './config';
import { selectActiveSubtree, selectNodeName } from '../App/selectors';
import { selectNodeCoordinates } from './selectors';
import { WARSAW_COORDS } from './constants';

import DataBoxGrid from '../DataBoxGrid/index'

class MapPage extends React.Component {

  nodeToMarker = (nodeId) => {
    let name = this.props.nodeNameGetter(nodeId.toString());
    let coordinates = this.props.getNodeCoordinates(nodeId.toString());
    return (
      <Marker key={nodeId} position={coordinates}>
        <Popup>
          <span>{name}</span>
        </Popup>
      </Marker>
    )
  }

  mapTreeToMarkers = (tree) => {
    let activeNodes = []
    if (tree) {
      activeNodes.push(tree.get('node_id'))
      if (tree.get('children')) {
        tree.get('children').forEach((childTree) => {
          activeNodes.push(childTree.get('node_id'));
        })
      }
    }

    return activeNodes.map((nodeId) => this.nodeToMarker(nodeId))
  }

  getBounds = (tree) => {
    let bounds = []

    // Tree exists and is not empty
    if (tree) {
      bounds.push(this.props.getNodeCoordinates(tree.get('node_id').toString()))
      if (tree.get('children')) {
        tree.get('children').forEach((childTree) => {
          bounds.push(this.props.getNodeCoordinates(childTree.get('node_id').toString()))
        })
      }

    // If no tree is active, just render default bounds (for WARSAW_COORDS)
    } else {
      // create bounds for Warsaw because adding only one point causes render error
      bounds.push({lat: WARSAW_COORDS.lat - 0.1, lng: WARSAW_COORDS.lng + 0.1})
      bounds.push({lat: WARSAW_COORDS.lat + 0.1, lng: WARSAW_COORDS.lng + 0.1})
    }

    return bounds
  }

  getCenter = (tree) => {
    if (tree) {
      return this.props.getNodeCoordinates(tree.get('node_id').toString())
    } else {
      return WARSAW_COORDS
    }
  }

  render() {
    let activeSubtree = this.props.activeSubtree.get(0)
    return (
      <div>
      <Map
        style={{height: "300px"}}
        bounds={this.getBounds(activeSubtree)}
        center={this.getCenter(activeSubtree)}
        boundsOptions={{padding: config.mapPadding}}
      >
        <TileLayer
          url={'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}'}
          attribution={'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>'}
          maxZoom={config.mapMaxZoom}
          id={config.mapTileLayerId}
          accessToken={config.openStreetMapAccessToken}
        />
        {this.mapTreeToMarkers(activeSubtree)}
      </Map>
      <DataBoxGrid/>
      </div>
    );
  }
}

const mapStateToProps = createStructuredSelector({
  activeSubtree: selectActiveSubtree,
  getNodeCoordinates: selectNodeCoordinates,
  nodeNameGetter: selectNodeName
});

// Wrap the component to inject dispatch and state into it
export default connect(mapStateToProps)(MapPage);
