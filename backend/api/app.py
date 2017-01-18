from pycnic.core import WSGI
from api.tree import *


class Application(WSGI):
    routes = [
        (r'/tree', Tree()),
        (r'/tree/(\d+)', Tree()),
        (r'/node', Node()),
        (r'/node/(\d+)', Node()),
    ]
