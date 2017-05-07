#!/usr/bin/env python3
import configparser

from pycnic.core import WSGI

from api.alert import AlertHandler
from api.entity_type import EntityTypeHandler
from api.global_metadata import TimestampHandler, PingHandler
from api.meta_attribute import MetaAttributeHandler
from api.series_attribute import SeriesAttributeHandler
from api.tag_attribute import TagAttributeHandler
from api.tree import EntityHandler, TreeHandler


def get_allowed_origin(config_file='config/servers.ini'):
    config = configparser.ConfigParser()
    config.read(config_file)

    return config.get('api', 'allowed_origin')


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

        # global metadata and utils
        (r'/meta/timestamp', TimestampHandler()),
        (r'/meta/ping', PingHandler()),

        # alerts
        (r'/alert', AlertHandler()),
        (r'/alert/(\d+)', AlertHandler()),
    ]
    headers = [
        ('Access-Control-Allow-Origin', get_allowed_origin()),
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
