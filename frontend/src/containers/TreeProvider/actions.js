import {
  DOWNLOAD_TREE,
} from './constants'

export function downloadTree(timestampUrl, treeUrl) {
  return {
    type: DOWNLOAD_TREE,
    timestampUrl,
    treeUrl,
  }
}
