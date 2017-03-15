import threading
from typing import List, Dict, Any
from voluptuous import Schema, Required, Any

from websocket.handlers import NewChartRequestHandler, NewLiveDataRequestHandler


class RequestProcessor(object):

    HANDLER_CLASSES = {
        'new_chart': NewChartRequestHandler,
        'new_live_data': NewLiveDataRequestHandler,
    }

    REQUEST_SCHEMA = Schema({
        Required('request_id'): Any(int, None),
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

    def run_requests(self) -> List[Dict[str, Any]]:
        self._cleanup()
        responses = []
        for key in self._requests:
            response = self._requests[key]()
            if response:
                responses.append(response)
        return responses

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
                raise ValueError('Request type {} not found'.format(type))
        finally:
            self._lock.release()
