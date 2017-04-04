import React from 'react';
import { connect } from 'react-redux';
import { Map, Marker, Popup, TileLayer } from 'react-leaflet';
import { createStructuredSelector } from 'reselect';
import { fromJS } from 'immutable';


import config from './config';
import { selectActiveSubtree } from '../App/selectors';
import { selectNodeCoordinates } from './selectors';
import { WARSAW_COORDS } from './constants';

import DataBoxGrid from '../DataBoxGrid/index'

class MapPage extends React.Component {

  mapTreeToMarkers = (tree) => {
    if (tree.get(0)) {
      let markers = [];
      let nodeId = tree.get(0).get('node_id').toString();
      let coordinates = this.props.getNodeCoordinates(nodeId);
      markers.push(
        <Marker key={nodeId} position={coordinates}>
          <Popup>
            <span>Grouping node<br/>id: {nodeId}</span>
          </Popup>
        </Marker>
      );
      tree.get(0).get('children').forEach(node => {
        let nodeId = node.get('node_id').toString();
        let coordinates = this.props.getNodeCoordinates(nodeId);
        markers.push(
          <Marker key={nodeId} position={coordinates}>
            <Popup>
              <span>Child node<br/>id: {nodeId}.</span>
            </Popup>
          </Marker>
        );
      });
      return markers;
    }
  }

  getBounds = (tree) => {
    var upperLeft = [1, 1];
    var lowerRight = [0, 0];

    // Tree exists and is not empty
    if (tree.get(0)) {
      let nodeId = tree.get(0).get('node_id').toString();
      let coordinates = this.props.getNodeCoordinates(nodeId);
      upperLeft = coordinates.slice();
      lowerRight = coordinates.slice();


      for (var i = 0; i < tree.get(0).get('children').size; ++i) {
        let nodeId = tree.get(0).get('children').get(i).get('node_id').toString();
        let coordinates = this.props.getNodeCoordinates(nodeId);
        upperLeft[0] = Math.max(upperLeft[0], coordinates[0]);
        upperLeft[1] = Math.min(upperLeft[1], coordinates[1]);
        lowerRight[0] = Math.min(lowerRight[0], coordinates[0]);
        lowerRight[1] = Math.max(lowerRight[1], coordinates[1]);
      }
    }

    // If no tree is active, just render default bounds (for WARSAW_COORDS)
    else {
      upperLeft = WARSAW_COORDS.slice();
      lowerRight = WARSAW_COORDS.slice();
      upperLeft[0] += 0.1;
      upperLeft[1] -= 0.1;
      lowerRight[0] -= 0.1;
      lowerRight[1] += 0.1;
    }

    return [upperLeft, lowerRight];
  }

  render() {
    let nodeId = this.props.tree.get(0, fromJS({})).get('node_id', null)
    let center = null
    if (nodeId != null) {
      center = this.props.getNodeCoordinates(this.props.tree.get(0, fromJS({})).get('node_id', null).toString())
    }
    if (center == null) {
      center = WARSAW_COORDS;
    }
    return (
      <div>
      <Map
        style={{height: "300px"}}
        bounds={this.getBounds(this.props.tree)}
        center={center}
        boundsOptions={{padding: config.mapPadding}}
      >
        <TileLayer
          url={'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}'}
          attribution={'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>'}
          maxZoom={config.mapMaxZoom}
          id={config.mapTileLayerId}
          accessToken={config.openStreetMapAccessToken}
        />
        {this.mapTreeToMarkers(this.props.tree)}
      </Map>
      <DataBoxGrid/>
      </div>
    );
  }
}

const mapStateToProps = createStructuredSelector({
  tree: selectActiveSubtree,
  getNodeCoordinates: selectNodeCoordinates
});

// Wrap the component to inject dispatch and state into it
export default connect(mapStateToProps)(MapPage);
