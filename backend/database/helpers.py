import time

from database.model import GlobalMetadata


def get_all(session, cls, **kwargs):
    return session.query(cls).filter_by(delete_ts=None, **kwargs).all()


def get_one(session, cls, **kwargs):
    if 'exception_cls' in kwargs:
        exception_cls = kwargs['exception_cls']
        del kwargs['exception_cls']
    else:
        from pycnic.errors import HTTP_404
        exception_cls = HTTP_404
    result = session.query(cls).filter_by(delete_ts=None, **kwargs).all()
    if len(result) != 1:
        raise exception_cls("{} with ID: {} not found".format(cls.__name__, kwargs.get('id', '?')))
    else:
        return result[0]


def update_last_data_modification_ts(session):
    result = session.query(GlobalMetadata).all()
    if not result:
        metadata = GlobalMetadata()
        session.add(metadata)
    else:
        metadata = result[0]
    metadata.last_data_modification_ts = int(time.time())
    session.commit()
