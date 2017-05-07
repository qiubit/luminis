/*
 * Copyright (C) 2017 Paweł Goliński
 * Copyright (C) 2017 Piotr Wiśniewski
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the LICENSE file for details.
 */


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
