from pycnic.errors import HTTP_404


def get_all(session, cls, **kwargs):
    return session.query(cls).filter_by(**kwargs, delete_ts=None).all()


def get_one(session, cls, **kwargs):
    result = session.query(cls).filter_by(**kwargs, delete_ts=None).all()
    if len(result) != 1:
        raise HTTP_404("{} with ID: {} not found".format(cls.__name__, kwargs["id"]))
    else:
        return result[0]
