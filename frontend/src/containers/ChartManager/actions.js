import { SAVE_ACTIVE_REQUEST_ID } from './constants'

export function saveActiveRequestId(activeRequestId) {
  return {
    type: SAVE_ACTIVE_REQUEST_ID,
    activeRequestId
  }
}
