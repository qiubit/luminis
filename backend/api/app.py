#!/usr/bin/env python3

from pycnic.core import WSGI

from api.entity_type import EntityTypeHandler
from api.tree import *


class Application(WSGI):
    routes = [
        (r'/tree', TreeHandler()),
        (r'/tree/(\d+)', TreeHandler()),
        (r'/node', NodeHandler()),
        (r'/node/(\d+)', NodeHandler()),
        (r'/entity_type', EntityTypeHandler()),
        (r'/entity_type/(\d+)', EntityTypeHandler()),
    ]

if __name__ == "__main__":
    # this module can be executed to get simple WSGI server on localhost:8080
    from wsgiref.simple_server import make_server
    try:
        print("Serving on 0.0.0.0:8080...")
        make_server('0.0.0.0', 8080, Application).serve_forever()
    except KeyboardInterrupt:
        pass
    print("Done")
