from pycnic.core import Handler

from database.helpers import get_one
from database.model import Session, GlobalMetadata


class TimestampHandler(Handler):

    def __init__(self):
        self.session = Session()

    def get(self):
        return {
            'success': True,
            'timestamp': get_one(self.session, GlobalMetadata).last_data_modification_ts,
        }


class PingHandler(Handler):

    def get(self):
        return {'success': True}
