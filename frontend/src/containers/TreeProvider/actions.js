import {
  DOWNLOAD_TREE,
  SAVE_TREE
} from './constants'

export function downloadTree(url) {
  return {
    type: DOWNLOAD_TREE,
    url: url
  }
}

export function saveTree(tree) {
  return {
    type: SAVE_TREE,
    dataTree: tree
  }
}
