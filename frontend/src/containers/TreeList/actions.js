/*
 * Copyright (C) 2017 Paweł Goliński
 * Copyright (C) 2017 Piotr Wiśniewski
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the LICENSE file for details.
 */


import {
  CHANGE_NODE_TOGGLE,
} from './constants.js'

export function changeNodeToggle(nodeId, nodeToggle) {
  return {
    type: CHANGE_NODE_TOGGLE,
    nodeId,
    nodeToggle
  }
}
