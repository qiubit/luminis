from pycnic.errors import HTTP_404


def get_all(session, cls):
    return session.query(cls).filter_by(delete_ts=None).all()


def get_one(session, cls, ident):
    result = session.query(cls).filter_by(id=ident, delete_ts=None).all()
    if len(result) != 1:
        raise HTTP_404("{} with ID: {} not found".format(cls.__name__, ident))
    else:
        return result[0]