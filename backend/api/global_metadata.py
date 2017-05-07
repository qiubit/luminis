#
# Copyright (C) 2017 Dominik Murzynowski
#
# This software may be modified and distributed under the terms
# of the MIT license.  See the LICENSE file for details.
#

from pycnic.core import Handler

from database.helpers import get_last_data_modification_ts
from database.model import Session


class TimestampHandler(Handler):

    def __init__(self):
        self.session = Session()

    def get(self):
        return {
            'success': True,
            'timestamp': get_last_data_modification_ts(self.session),
        }


class PingHandler(Handler):

    def get(self):
        return {'success': True}
