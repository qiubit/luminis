import React from 'react';

const styles = {
  container: {
    textAlign: 'center',
    paddingTop: 200,
  },
}

class LandingPage extends React.Component {
  render() {
    return (
      <div style={styles.container}>
        <h1>Welcome to Luminis!</h1>
        <h3>Select option from menu above</h3>
      </div>
    );
  }
}

export default LandingPage;