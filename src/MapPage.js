import React from 'react';

const styles = {
  container: {
    marginTop: 48,
    marginBottom: 48,
    marginLeft: 272,
    marginRight: 72,
  },
};

class MapPage extends React.Component {
  render() {
    return (
      <div>
        <div style={styles.container}>
          <h1>This is map placeholder</h1>
        </div>
        <div style={styles.container}>
          <h1>This is chart placeholder</h1>
        </div>
      </div>
    );
  }
}

export default MapPage;