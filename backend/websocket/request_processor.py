#
# Copyright (C) 2017 Dominik Murzynowski
#
# This software may be modified and distributed under the terms
# of the MIT license.  See the LICENSE file for details.
#

import threading
from typing import Dict, Any, Iterable
from voluptuous import Schema, Required, Or

from websocket.handlers import NewChartRequestHandler, NewLiveDataRequestHandler


class RequestProcessor(object):

    HANDLER_CLASSES = {
        'new_chart': NewChartRequestHandler,
        'new_live_data': NewLiveDataRequestHandler,
    }

    REQUEST_SCHEMA = Schema({
        Required('request_id'): Or(int, None),
        Required('type'): str,
        Required('params'): dict,
    })

    def __init__(self):
        self._requests = dict()
        self._lock = threading.Lock()

    def _cleanup(self):
        self._lock.acquire()
        try:
            requests_to_be_removed = [key for key in self._requests if self._requests[key].to_be_removed]
            for r in requests_to_be_removed:
                del self._requests[r]
        finally:
            self._lock.release()

    def run_requests(self) -> Iterable[Dict[str, Any]]:
        self._cleanup()
        for key in self._requests:
            response = self._requests[key]()
            if response:
                yield response

    def process_new_request(self, payload: dict):
        self._lock.acquire()
        self.REQUEST_SCHEMA(payload)
        request_id = payload['request_id']
        request_type = payload['type']
        params = payload['params']
        try:
            if request_type == 'cancel_request':
                request_id = params.get('request_id')
                if request_id in self._requests:
                    self._requests[request_id].remove()
                else:
                    raise ValueError('request_id {} not found'.format(request_id))
            elif request_type in self.HANDLER_CLASSES:
                handler = self.HANDLER_CLASSES[request_type](request_id, params)
                self._requests[request_id] = handler
            else:
                raise ValueError('Request type {} not found'.format(request_type))
        finally:
            self._lock.release()
