def get_all(session, cls, **kwargs):
    return session.query(cls).filter_by(**kwargs, delete_ts=None).all()


def get_one(session, cls, **kwargs):
    if 'exception_cls' in kwargs:
        exception_cls = kwargs['exception_cls']
        del kwargs['exception_cls']
    else:
        from pycnic.errors import HTTP_404
        exception_cls = HTTP_404
    result = session.query(cls).filter_by(**kwargs, delete_ts=None).all()
    if len(result) != 1:
        raise exception_cls("{} with ID: {} not found".format(cls.__name__, kwargs["id"]))
    else:
        return result[0]
