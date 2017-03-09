import { SAVE_DATABOX_REQUESTS } from './constants'

export function saveDataBoxRequests(databoxRequests) {
  return {
    type: SAVE_DATABOX_REQUESTS,
    databoxRequests
  }
}
