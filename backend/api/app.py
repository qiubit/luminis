#!/usr/bin/env python3

from pycnic.core import WSGI

from api.entity_type import EntityTypeHandler
from api.meta_attribute import MetaAttributeHandler
from api.series_attribute import SeriesAttributeHandler
from api.tag_attribute import TagAttributeHandler
from api.tree import EntityHandler, TreeHandler


class Application(WSGI):
    routes = [
        # trees and nodes
        (r'/tree', TreeHandler()),
        (r'/tree/(\d+)', TreeHandler()),
        (r'/node', EntityHandler()),
        (r'/node/(\d+)', EntityHandler()),

        # entity types and attributes
        (r'/entity_type', EntityTypeHandler()),
        (r'/entity_type/(\d+)', EntityTypeHandler()),
        (r'/entity_type/(\d+)/tag', TagAttributeHandler()),
        (r'/entity_type/(\d+)/tag/(\d+)', TagAttributeHandler()),
        (r'/entity_type/(\d+)/series', SeriesAttributeHandler()),
        (r'/entity_type/(\d+)/series/(\d+)', SeriesAttributeHandler()),
        (r'/entity_type/(\d+)/meta', MetaAttributeHandler()),
        (r'/entity_type/(\d+)/meta/(\d+)', MetaAttributeHandler()),
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
