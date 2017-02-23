import {
  DOWNLOAD_TREE,
} from './constants'

export function downloadTree(url) {
  return {
    type: DOWNLOAD_TREE,
    url: url
  }
}
