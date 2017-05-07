#!/usr/bin/env python

#
# Copyright (C) 2017 Dominik Murzynowski
#
# This software may be modified and distributed under the terms
# of the MIT license.  See the LICENSE file for details.
#

import configparser
import json
import urllib.parse

from tornado.websocket import WebSocketHandler
from tornado.web import Application
from tornado.ioloop import IOLoop, PeriodicCallback

from websocket.request_processor import RequestProcessor


class WSHandler(WebSocketHandler):
    """ Handler of WebSocket request.
    """

    def __init__(self, application, request, **kwargs):
        super(WSHandler, self).__init__(application, request)
        self._callback = None
        self._processor = RequestProcessor()
        self._push_interval = kwargs['push_interval']
        self._allowed_origins = None if kwargs['allowed_origins'] == 'ALL' else kwargs['allowed_origins'].split(',')

    def check_origin(self, origin):
        parsed_origin = urllib.parse.urlparse(origin)
        return self._allowed_origins is None or parsed_origin.netloc.lower() in self._allowed_origins

    def _run_callback(self):
        for response in self._processor.run_requests():
            self.write_message(json.dumps(response))

    def open(self, *args, **kwargs):
        print("Connection created")
        self._callback = PeriodicCallback(self._run_callback, self._push_interval * 1000)
        self._callback.start()

    def on_close(self):
        self._callback.stop()

    def on_message(self, message):
        msg = json.loads(message)
        try:
            self._processor.process_new_request(msg)
            # response = {
            #     'status': 'ok',
            #     'request_id': msg['request_id'],
            # }
        except Exception as err:
            # response = {
            #     'status': 'error',
            #     'request_id': msg['request_id'],
            #     'error': str(err),
            # }
            pass
        # self.write_message(json.dumps(response))


def get_config(filename):
    """ Reads needed configuration values from given file and returns
    them as a dict.
    """
    result = {}
    config = configparser.ConfigParser()
    config.read(filename)

    params = {"push_interval": int, "port": int, "allowed_origins": str}
    for param in params:
        result[param] = params[param](config.get("websocket", param))
    return result


def main():
    config = get_config("config/servers.ini")

    # start our application - we need only one handler for websocket interface only
    application = Application([
        (r'/', WSHandler, config)
    ])
    application.listen(config['port'])
    print('Server listening on port {}'.format(config['port']))
    IOLoop.current().start()

if __name__ == "__main__":
    main()
