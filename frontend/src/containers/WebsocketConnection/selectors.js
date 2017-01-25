import { createSelector } from 'reselect';

export const selectWebsocketConnection = (state) => state.get('WebsocketConnection')

export const selectMeasurementData = createSelector(
  selectWebsocketConnection,
  (websocketConnection) => websocketConnection.get('measurementData')
);
