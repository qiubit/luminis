#!/usr/bin/env python

import configparser
import json
import logging
import threading

import time
from time import sleep

from tornado.websocket import WebSocketHandler
from tornado.web import Application
from tornado.ioloop import IOLoop

from database.helpers import get_current_measurements


def time():
    return int(time.time())


class WSHandler(WebSocketHandler):
    """ Handler of WebSocket request.
    """

    def __init__(self, application, request, **kwargs):
        super(WSHandler, self).__init__(application, request)
        self._subscription = []  # initially no nodes to send
        self._last_pulling_ts = time()
        self._push_interval = kwargs['push_interval']
        self._initial_pulling_delta = kwargs['initial_pulling_delta']

    def _push_loop(self):
        while not self._on_close_called:
            self.write_message(json.dumps(get_current_measurements(self._subscription, self._last_pulling_ts)))
            self._last_pulling_ts = time()
            sleep(self._push_interval)

    def check_origin(self, origin):
        return True  # TODO we really should make sure that request is from our website to prevent XSS

    def open(self, *args, **kwargs):
        print("Connection created")
        threading.Thread(target=self._push_loop, daemon=True).start()

    def on_message(self, message):
        try:
            new_subscription = json.loads(message)
            # simple input validation
            if isinstance(new_subscription, list) and all(isinstance(a, int) for a in new_subscription):
                self._subscription = sorted(new_subscription)
                # reset data pulling range
                self._last_pulling_ts = min(time() - self._initial_pulling_delta, self._last_pulling_ts)
            else:
                print("Bad new subscription request: \"{}\"".format(message))
        except json.JSONDecodeError:
            print("Bad new subscription request: \"{}\"".format(message))


def get_config(filename):
    """ Reads needed configuration values from given file and returns
    them as a dict.
    """
    result = {}
    config = configparser.ConfigParser()
    config.read(filename)

    params = {"push_interval": int, "port": int, "initial_pulling_delta": int}
    for param in params:
        result[param] = params[param](config.get("websocket", param))
    return result

if __name__ == "__main__":
    config = get_config("config/websocket.ini")

    # start our application - we need only one handler for websocket interface only
    application = Application([
            (r'/', WSHandler, config)
    ])
    application.listen(config['port'])
    print('Server listening on port {}'.format(config['port']))
    IOLoop.current().start()
