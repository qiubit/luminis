import React from 'react';
import { connect } from 'react-redux';
import { Map, Marker, Popup, TileLayer } from 'react-leaflet';
import { createStructuredSelector } from 'reselect';

import config from './config';
import { selectActiveSubtree } from './selectors';
import { WARSAW_COORDS } from './constants';

class MapPage extends React.Component {

  mapTreeToMarkers = (tree) => {
    if (tree.get(0)) {
      let markers = [];
      markers.push(
        <Marker key={tree.get(0).get('id')} position={tree.get(0).get('position').toJS()}>
          <Popup>
            <span>Grouping node<br/>id: {tree.get(0).get('id')}</span>
          </Popup>
        </Marker>
      );
      tree.get(0).get('children').forEach(node => {
        markers.push(
          <Marker key={node.get('id')} position={node.get('position').toJS()}>
            <Popup>
              <span>Child node<br/>id: {node.get('id')}.</span>
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
      upperLeft[0] = tree.get(0).get('position').get(0);
      upperLeft[1] = tree.get(0).get('position').get(1);
      lowerRight[0] = tree.get(0).get('position').get(0);
      lowerRight[1] = tree.get(0).get('position').get(1);

      for (var i = 0; i < tree.get(0).get('children').size; ++i) {
        upperLeft[0] = Math.max(upperLeft[0], tree.get(0).get('children').get(i).get('position').get(0));
        upperLeft[1] = Math.min(upperLeft[1], tree.get(0).get('children').get(i).get('position').get(1));
        lowerRight[0] = Math.min(lowerRight[0], tree.get(0).get('children').get(i).get('position').get(0));
        lowerRight[1] = Math.max(lowerRight[1], tree.get(0).get('children').get(i).get('position').get(1));
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
    return (
      <Map
        center={this.props.tree.get(0) ? this.props.tree.get(0).get('position').toJS() : WARSAW_COORDS}
        style={{height: "300px"}}
        bounds={this.getBounds(this.props.tree)}
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
    );
  }
}

const mapStateToProps = createStructuredSelector({
  tree: selectActiveSubtree,
});

// Wrap the component to inject dispatch and state into it
export default connect(mapStateToProps)(MapPage);
