import React from 'react';
import { Map, Marker, Popup, TileLayer } from 'react-leaflet';
import config from './config';


const styles = {
  container: {
    marginTop: 48,
    marginBottom: 48,
    marginLeft: 272,
    marginRight: 72,
  },
};

class MapPage extends React.Component {

  mapTreeToMarkers = (tree) => {
    if (tree){
      return (
          <div>
          <Marker key={tree[0].id} position={tree[0].position}>
            <Popup>
              <span>Grouping node<br/>id: {tree[0].id}</span>
            </Popup>
          </Marker>
          {
            tree[0].children.map(node => (
              <Marker key={node.id} position={node.position}>
                <Popup>
                  <span>Child node<br/>id: {node.id}.</span>
                </Popup>
              </Marker>
            ))
          }
          </div>
      );
    }
  }

  getBounds = (tree) => {
    var upperLeft = [1, 1];
    var lowerRight = [0, 0];

    if (tree) {
      upperLeft[0] = tree[0].position[0];
      upperLeft[1] = tree[0].position[1];
      lowerRight[0] = tree[0].position[0];
      lowerRight[1] = tree[0].position[1];
    }

    for (var i = 0; i < tree[0].children.length; ++i) {
      upperLeft[0] = Math.max(upperLeft[0], tree[0].children[i].position[0]);
      upperLeft[1] = Math.min(upperLeft[1], tree[0].children[i].position[1]);
      lowerRight[0] = Math.min(lowerRight[0], tree[0].children[i].position[0]);
      lowerRight[1] = Math.max(lowerRight[1], tree[0].children[i].position[1]);
    }

    return [upperLeft, lowerRight];
  }

  render() {
    return (
      <Map
        center={this.props.position}
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

export default MapPage;
