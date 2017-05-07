/*
 * Copyright (C) 2017 Paweł Goliński
 * Copyright (C) 2017 Piotr Wiśniewski
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the LICENSE file for details.
 */


import { SAVE_ACTIVE_REQUEST_ID } from './constants'

export function saveActiveRequestId(activeRequestId) {
  return {
    type: SAVE_ACTIVE_REQUEST_ID,
    activeRequestId
  }
}
