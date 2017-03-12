import { createSelector } from 'reselect';

export const selectWebsocketConnection = (state) => state.get('WebsocketConnection')

export const selectWebsocket = createSelector(
    selectWebsocketConnection,
    (websocketConnection) => websocketConnection.get('websocket')
)
