import { createSelector } from 'reselect';

import { selectNodePositionX, selectNodePositionY } from '../App/selectors'

export const selectNodeCoordinates = createSelector(
  selectNodePositionX,
  selectNodePositionY,
  (getNodePositionX, getNodePositionY) => (nodeId) => {
    let x = getNodePositionX(nodeId);
    let y = getNodePositionY(nodeId);
    if (x == null || y == null) {
      return null;
    } else {
      return {
        lat: Number(x),
        lng: Number(y)
      }
    }
  }
);
